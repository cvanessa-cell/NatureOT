import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import {
  COMPARE_WORKTREE_DIR,
  DEFAULT_BRANCH_PORT,
  DEFAULT_COMPARE_ROUTES,
  DEFAULT_MAIN_PORT,
  prepareWorktreeForDev,
  resolvePort,
  sanitizeBranchFolderName,
  startDevServer,
  waitForPortAvailable,
} from "../../../scripts/compare-ui-branches.mjs";
import {
  deleteComparisonTarget,
  detectMainBranch,
  ensureGitLongPaths,
  listWorktrees,
  loadRepoOverview,
  runGit,
} from "./git-info.mjs";

const DEFAULT_ROUTES = DEFAULT_COMPARE_ROUTES;

const sessions = new Map();

function listRootFiles(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

async function waitForUrl(url, child, label) {
  const timeoutMs = 360_000;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (child?.exitCode !== null && child?.exitCode !== undefined) {
      throw new Error(
        `${label} dev server exited before ${url} was ready (code ${child.exitCode}). Check the ui-compare terminal.`,
      );
    }
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch {
      // still starting
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(
    `Server did not respond at ${url} within 6 minutes. First compare installs deps in worktrees — watch the ui-compare terminal.`,
  );
}

function compareParentDirs(repoRoot) {
  return [
    join(repoRoot, ".ui-compare"),
    resolve(repoRoot, "..", COMPARE_WORKTREE_DIR),
  ];
}

function preferredWorktreePath(repoRoot, targetId, mainBranch) {
  const parents = compareParentDirs(repoRoot);
  const folder =
    targetId === "main" ? "main" : sanitizeBranchFolderName(targetId);
  return join(parents[0], folder);
}

async function worktreeHasCommit(repoRoot, worktreePath, commit) {
  try {
    const head = await runGit(["-C", worktreePath, "rev-parse", "HEAD"], repoRoot);
    return head === commit;
  } catch {
    return false;
  }
}

function normalizePath(p) {
  return resolve(p).toLowerCase();
}

async function findExistingWorktree(
  repoRoot,
  { commit, branchName },
  excludePaths = [],
) {
  const excluded = new Set(excludePaths.map(normalizePath));
  const trees = await listWorktrees(repoRoot);
  for (const tree of trees) {
    if (!existsSync(join(tree.path, "package.json"))) continue;
    if (excluded.has(normalizePath(tree.path))) continue;
    if (tree.head === commit) return tree.path;
    if (branchName && tree.branch === branchName) return tree.path;
  }
  return null;
}

function parseCheckedOutPath(gitError) {
  const message = gitError?.message || String(gitError);
  const match = message.match(/already checked out at '([^']+)'/i);
  return match?.[1] || null;
}

async function ensureWorktreeAt(repoRoot, targetPath, commitish) {
  const commit = await runGit(["rev-parse", commitish], repoRoot);

  if (existsSync(targetPath)) {
    if (await worktreeHasCommit(repoRoot, targetPath, commit)) return targetPath;
    await runGit(["worktree", "remove", "--force", targetPath], repoRoot).catch(() => {});
  }

  mkdirSync(resolve(targetPath, ".."), { recursive: true });
  await ensureGitLongPaths(repoRoot);

  try {
    await runGit(["worktree", "add", "--detach", targetPath, commit], repoRoot);
    return targetPath;
  } catch (error) {
    const checkedOutPath = parseCheckedOutPath(error);
    if (
      checkedOutPath &&
      normalizePath(checkedOutPath) === normalizePath(targetPath) &&
      existsSync(join(checkedOutPath, "package.json"))
    ) {
      return checkedOutPath;
    }
    throw error;
  }
}

async function ensureWorktree(repoRoot, targetPath, commitish) {
  const commit = await runGit(["rev-parse", commitish], repoRoot);

  const existing = await findExistingWorktree(repoRoot, { commit });
  if (existing) return existing;

  return ensureWorktreeAt(repoRoot, targetPath, commit);
}

function worktreePathForTarget(repoRoot, targetId, mainBranch) {
  if (targetId === "working-copy") return repoRoot;
  return preferredWorktreePath(repoRoot, targetId, mainBranch);
}

async function resolveTarget(
  repoRoot,
  targetId,
  _compareParent,
  mainBranch,
  excludePaths = [],
) {
  if (targetId === "working-copy") {
    return {
      path: repoRoot,
      label: "Uncommitted changes",
      commit: "working-copy",
      worktreePath: null,
    };
  }
  if (targetId === "main") {
    const mainCommit = await runGit(["rev-parse", mainBranch], repoRoot);
    const dedicatedMainPath = preferredWorktreePath(repoRoot, "main", mainBranch);
    const mainPath = await ensureWorktreeAt(repoRoot, dedicatedMainPath, mainCommit);
    return { path: mainPath, label: mainBranch, commit: mainCommit, worktreePath: mainPath };
  }
  const commit = await runGit(["rev-parse", targetId], repoRoot);
  const branchName = targetId.includes("/") || !/^[0-9a-f]{7,40}$/i.test(targetId)
    ? targetId
    : null;
  const existing = await findExistingWorktree(repoRoot, { commit, branchName }, excludePaths);
  const branchPath = existing ?? await ensureWorktree(
    repoRoot,
    preferredWorktreePath(repoRoot, targetId, mainBranch),
    commit,
  );
  const subject = await runGit(["log", "-1", "--format=%s", commit], repoRoot).catch(() => "");
  const label = subject ? `${targetId} (${subject.slice(0, 48)})` : targetId;
  return { path: branchPath, label, commit, worktreePath: branchPath };
}

function sideChildKey(side) {
  return side === "left" ? "leftChild" : "rightChild";
}

function stopSideServer(session, side) {
  const key = sideChildKey(side);
  const child = session[key];
  if (child && !child.killed) {
    if (process.platform === "win32" && child.pid) {
      spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        shell: true,
        stdio: "ignore",
      }).unref();
    } else {
      child.kill("SIGTERM");
    }
  }
  session[key] = null;
}

function buildPane(target, port, url, active = true) {
  return {
    id: target.id ?? target.label,
    label: target.label,
    commit: target.commit,
    port,
    url,
    active,
  };
}

async function startPaneServer(session, side, targetId) {
  const mainBranch = await detectMainBranch(session.repoRoot);
  const opponent = side === "left" ? session.right : session.left;
  const excludePaths =
    opponent?.id === "working-copy" || targetId === "working-copy"
      ? [session.repoRoot]
      : [];
  const target = await resolveTarget(
    session.repoRoot,
    targetId,
    null,
    mainBranch,
    excludePaths,
  );

  const pane = session[side];
  const port = pane?.port ?? (side === "left"
    ? await resolvePort(DEFAULT_MAIN_PORT, [DEFAULT_BRANCH_PORT])
    : await resolvePort(DEFAULT_BRANCH_PORT, [session.left?.port].filter(Boolean)));

  await prepareWorktreeForDev(target.path, session.repoRoot, side);

  stopSideServer(session, side);
  const child = startDevServer(target.path, side, port);
  session[sideChildKey(side)] = child;

  const url = `http://127.0.0.1:${port}`;
  await waitForUrl(url, child, side === "left" ? "Left" : "Right");

  session[side] = buildPane(
    { id: targetId, label: target.label, commit: target.commit },
    port,
    url,
    true,
  );
  return session[side];
}

function clearPane(session, side) {
  stopSideServer(session, side);
  const previous = session[side];
  session[side] = {
    id: previous?.id ?? null,
    label: previous?.label ?? null,
    commit: previous?.commit ?? null,
    port: previous?.port ?? null,
    url: null,
    active: false,
  };
}

export function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

export function serializeSession(session) {
  return {
    id: session.id,
    repoRoot: session.repoRoot,
    keptSide: session.keptSide,
    left: session.left,
    right: session.right,
    routes: session.routes,
    createdAt: session.createdAt,
  };
}

export async function startComparison(repoRoot, { leftId, rightId, routes = DEFAULT_ROUTES }) {
  if (!leftId || !rightId) throw new Error("Select a left and right version to compare.");
  if (leftId === rightId) throw new Error("Choose two different versions.");

  const mainBranch = await detectMainBranch(repoRoot);
  const usesWorkingCopy = leftId === "working-copy" || rightId === "working-copy";
  const excludePaths = usesWorkingCopy ? [repoRoot] : [];

  const [leftTarget, rightTarget] = await Promise.all([
    resolveTarget(repoRoot, leftId, null, mainBranch, excludePaths),
    resolveTarget(repoRoot, rightId, null, mainBranch, excludePaths),
  ]);

  await prepareWorktreeForDev(leftTarget.path, repoRoot, "left");
  await prepareWorktreeForDev(rightTarget.path, repoRoot, "right");

  const leftPort = await resolvePort(DEFAULT_MAIN_PORT, [DEFAULT_BRANCH_PORT]);
  const rightPort = await resolvePort(DEFAULT_BRANCH_PORT, [leftPort]);

  await waitForPortAvailable(leftPort);
  await waitForPortAvailable(rightPort);

  const leftUrl = `http://127.0.0.1:${leftPort}`;
  const rightUrl = `http://127.0.0.1:${rightPort}`;

  // Start panes sequentially so Turbopack does not treat both checkouts as one project.
  const leftChild = startDevServer(leftTarget.path, "left", leftPort);
  await waitForUrl(leftUrl, leftChild, "Left");

  const rightChild = startDevServer(rightTarget.path, "right", rightPort);
  await waitForUrl(rightUrl, rightChild, "Right");

  const sessionId = randomUUID();
  const session = {
    id: sessionId,
    repoRoot,
    keptSide: null,
    left: buildPane({ id: leftId, label: leftTarget.label, commit: leftTarget.commit }, leftPort, leftUrl),
    right: buildPane({ id: rightId, label: rightTarget.label, commit: rightTarget.commit }, rightPort, rightUrl),
    routes,
    leftChild,
    rightChild,
    createdAt: new Date().toISOString(),
  };
  sessions.set(sessionId, session);
  return serializeSession(session);
}

export async function applyDecision(sessionId, { side, action }) {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");
  if (side !== "left" && side !== "right") throw new Error("side must be left or right");

  const pane = session[side];
  if (!pane?.id) throw new Error("No version loaded on that side.");

  if (action === "keep") {
    if (session.keptSide && session.keptSide !== side) {
      const previousKept = session.keptSide;
      clearPane(session, previousKept);
      session.keptSide = side;
      const overview = await loadRepoOverview(session.repoRoot);
      return {
        session: serializeSession(session),
        showPicker: true,
        pickerSide: previousKept,
        overview,
      };
    }
    session.keptSide = side;
    return { session: serializeSession(session), showPicker: false, pickerSide: null };
  }

  if (action === "reject" || action === "replace") {
    if (session.keptSide === side) {
      throw new Error("Cannot reject or replace the kept version. Keep the other side first, or pick a replacement.");
    }

    const targetId = pane.id;
    clearPane(session, side);
    if (action === "reject") {
      if (process.platform === "win32") {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 750));
      }
      const mainBranch = await detectMainBranch(session.repoRoot);
      const worktreePath = worktreePathForTarget(session.repoRoot, targetId, mainBranch);
      await deleteComparisonTarget(session.repoRoot, targetId, worktreePath);
    }
    const overview = await loadRepoOverview(session.repoRoot);
    return {
      session: serializeSession(session),
      showPicker: true,
      pickerSide: side,
      overview,
      deleted: action === "reject",
    };
  }

  throw new Error(`Unknown action: ${action}`);
}

export async function replaceSideTarget(sessionId, { side, targetId }) {
  const session = getSession(sessionId);
  if (!session) throw new Error("Session not found");
  if (!targetId) throw new Error("targetId is required");

  const opponent = side === "left" ? session.right : session.left;
  const kept = session.keptSide ? session[session.keptSide] : null;
  const baseline = kept ?? opponent;

  if (baseline?.id && targetId === baseline.id) {
    throw new Error("Choose a different version than the kept baseline.");
  }

  await startPaneServer(session, side, targetId);
  return { session: serializeSession(session), showPicker: false, pickerSide: null };
}

export function stopSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return false;
  stopSideServer(session, "left");
  stopSideServer(session, "right");
  sessions.delete(sessionId);
  return true;
}
