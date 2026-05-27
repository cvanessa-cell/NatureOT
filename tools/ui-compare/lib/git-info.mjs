import { spawn } from "node:child_process";
import { join, resolve } from "node:path";
import {
  COMPARE_WORKTREE_DIR,
  sanitizeBranchFolderName,
} from "../../../scripts/compare-ui-branches.mjs";

export async function runGit(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, {
      cwd,
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("close", (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr || `git ${args.join(" ")} failed (${code})`));
    });
  });
}

export async function ensureGitLongPaths(repoRoot) {
  if (process.platform !== "win32") return;
  await runGit(["config", "core.longpaths", "true"], repoRoot).catch(() => {});
}

export async function listWorktrees(repoRoot) {
  const output = await runGit(["worktree", "list", "--porcelain"], repoRoot);
  const entries = [];
  let current = null;
  for (const line of output.split(/\r?\n/)) {
    if (line.startsWith("worktree ")) {
      if (current) entries.push(current);
      current = { path: line.slice("worktree ".length) };
    } else if (current && line.startsWith("HEAD ")) {
      current.head = line.slice("HEAD ".length);
    } else if (current && line.startsWith("branch ")) {
      current.branch = line.slice("branch ".length).replace(/^refs\/heads\//, "");
    } else if (current && line === "detached") {
      current.detached = true;
    }
  }
  if (current) entries.push(current);
  return entries;
}

export async function detectMainBranch(repoRoot) {
  for (const branch of ["main", "master"]) {
    try {
      await runGit(["show-ref", "--verify", "--quiet", `refs/heads/${branch}`], repoRoot);
      return branch;
    } catch {
      // try next
    }
  }
  return "main";
}

function parseShortStat(output) {
  if (!output.trim()) {
    return { files: 0, insertions: 0, deletions: 0, summary: "No file changes" };
  }
  const match = output.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/);
  if (!match) return { files: 0, insertions: 0, deletions: 0, summary: output.trim() };
  const files = Number(match[1] || 0);
  const insertions = Number(match[2] || 0);
  const deletions = Number(match[3] || 0);
  return {
    files,
    insertions,
    deletions,
    summary: `${files} file(s), +${insertions} / -${deletions} lines`,
  };
}

async function safeDiffStat(repoRoot, args) {
  try {
    const stat = await runGit(["diff", "--shortstat", ...args], repoRoot);
    return parseShortStat(stat);
  } catch {
    return { files: 0, insertions: 0, deletions: 0, summary: "Unable to compute diff" };
  }
}

export async function loadRepoOverview(repoRoot) {
  const mainBranch = await detectMainBranch(repoRoot);
  const mainCommit = await runGit(["rev-parse", mainBranch], repoRoot);
  const currentBranch = await runGit(["branch", "--show-current"], repoRoot).catch(() => "");
  const porcelain = await runGit(["status", "--porcelain"], repoRoot).catch(() => "");
  const dirty = porcelain.trim().length > 0;

  const localRaw = await runGit(["branch", "--format=%(refname:short)"], repoRoot);
  const localBranches = localRaw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  const remoteRaw = await runGit(["branch", "-r", "--format=%(refname:short)"], repoRoot).catch(() => "");
  const remoteBranches = remoteRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.endsWith("/HEAD"));

  const mainDescription = `Baseline at ${mainCommit.slice(0, 7)}. Other versions are described relative to this branch.`;

  const branches = [];
  const remoteOnlyBranches = [];

  for (const name of localBranches) {
    if (name === mainBranch) continue;
    const isRemote = false;
    let commitsAhead = 0;
    let commitLines = [];
    try {
      const countRaw = await runGit(
        ["rev-list", "--count", `${mainBranch}..${name}`],
        repoRoot,
      );
      commitsAhead = Number(countRaw) || 0;
      if (commitsAhead > 0) {
        const logRaw = await runGit(
          ["log", "--oneline", "-n", "5", `${mainBranch}..${name}`],
          repoRoot,
        );
        commitLines = logRaw.split(/\r?\n/).filter(Boolean);
      }
    } catch {
      // branch may not share history
    }

    const diffStat = await safeDiffStat(repoRoot, [mainBranch, "...", name]);
    const relative =
      commitsAhead === 0
        ? `Same commits as ${mainBranch} (UI may still differ if worktree is stale). ${diffStat.summary} vs ${mainBranch}.`
        : `${commitsAhead} commit(s) ahead of ${mainBranch}. ${diffStat.summary} vs ${mainBranch}.`;

    branches.push({
      id: name,
      name,
      kind: "local",
      commitsAhead,
      recentCommits: commitLines,
      diffStat,
      description: relative,
    });
  }

  for (const name of remoteBranches) {
    if (name === mainBranch || name.endsWith("/HEAD")) continue;
    const localName = name.replace(/^origin\//, "");
    if (localBranches.includes(localName) || localName === mainBranch) continue;
    remoteOnlyBranches.push({
      id: name,
      name,
      kind: "remote",
      description: `Remote tracking branch only (no local "${localName}"). Reject in compare removes local branches, not remotes.`,
    });
  }

  const uncommittedStat = dirty
    ? await safeDiffStat(repoRoot, [])
    : { files: 0, insertions: 0, deletions: 0, summary: "Working tree clean" };

  const changedFiles = dirty
    ? porcelain.split(/\r?\n/).map((line) => line.slice(3).trim()).filter(Boolean)
    : [];

  const uncommitted = {
    id: "working-copy",
    name: "Uncommitted changes",
    kind: "working-copy",
    dirty,
    currentBranch: currentBranch || "(detached)",
    changedFiles,
    diffStat: uncommittedStat,
    description: dirty
      ? `Local edits on top of ${currentBranch || "HEAD"} (${uncommittedStat.summary}). Not on any branch until committed.`
      : "No uncommitted edits in the project folder.",
  };

  return {
    repoRoot,
    mainBranch,
    mainCommit,
    currentBranch,
    dirty,
    main: {
      id: "main",
      name: mainBranch,
      kind: "main",
      commit: mainCommit,
      description: mainDescription,
    },
    branches,
    remoteOnlyBranches,
    uncommitted,
  };
}

export async function commitChanges(repoRoot, { message }) {
  if (!message?.trim()) throw new Error("Commit message is required.");
  await runGit(["add", "-A"], repoRoot);
  const status = await runGit(["status", "--porcelain"], repoRoot);
  if (!status.trim()) throw new Error("Nothing to commit.");
  await runGit(["commit", "-m", message.trim()], repoRoot);
  return loadRepoOverview(repoRoot);
}

/** Recent commits selectable for comparison (newest first). */
export async function listRecentCommits(repoRoot, { limit = 30 } = {}) {
  const logRaw = await runGit(
    ["log", "--oneline", `-n`, String(limit), "--all"],
    repoRoot,
  ).catch(() => "");
  return logRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const space = line.indexOf(" ");
      const hash = space === -1 ? line : line.slice(0, space);
      const subject = space === -1 ? "" : line.slice(space + 1);
      return {
        id: hash,
        name: `${hash.slice(0, 7)} — ${subject}`,
        kind: "commit",
        description: subject,
      };
    });
}

/** Known compare worktree folder paths for a branch/target id. */
export function compareWorktreePaths(repoRoot, targetId) {
  const folder = targetId === "main" ? "main" : sanitizeBranchFolderName(targetId);
  return [
    join(repoRoot, ".ui-compare", folder),
    join(resolve(repoRoot, "..", COMPARE_WORKTREE_DIR), folder),
  ];
}

function worktreePathMatchesTarget(worktreePath, targetId) {
  const folder = sanitizeBranchFolderName(targetId);
  const normalized = worktreePath.replace(/\\/g, "/");
  return (
    normalized.endsWith(`/${folder}`) ||
    normalized.endsWith(`/${folder}/`) ||
    normalized.includes(`/${folder}-`) ||
    normalized.includes(`--${folder.replace(/-/g, "-")}`)
  );
}

/** Map commit hashes to a single local branch when possible. */
export async function resolveDeletionTargetId(repoRoot, targetId) {
  if (targetId === "main" || targetId === "working-copy") return targetId;

  const localRaw = await runGit(["branch", "--format=%(refname:short)"], repoRoot).catch(() => "");
  const localBranches = localRaw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (localBranches.includes(targetId)) return targetId;

  if (!/^[0-9a-f]{7,40}$/i.test(targetId)) return targetId;

  const containingRaw = await runGit(
    ["branch", "--contains", targetId, "--format=%(refname:short)"],
    repoRoot,
  ).catch(() => "");
  const containing = containingRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((name) => localBranches.includes(name) && name !== "main");

  if (containing.length === 1) return containing[0];
  if (containing.length > 1) {
    const automation = containing.filter((name) => name.startsWith("automation/"));
    if (automation.length === 1) return automation[0];
  }

  return targetId;
}

/** Discard all uncommitted edits in the project folder (tracked + untracked). */
export async function discardWorkingCopyChanges(repoRoot) {
  const porcelain = await runGit(["status", "--porcelain"], repoRoot).catch(() => "");
  if (!porcelain.trim()) return { discarded: false };

  await runGit(["reset", "--hard", "HEAD"], repoRoot);
  await runGit(["clean", "-fd"], repoRoot);
  return { discarded: true };
}

/** Remove every worktree for this branch (detached compare trees, Codex paths, etc.). */
export async function removeWorktreesForBranch(repoRoot, branchName, { extraPaths = [] } = {}) {
  const repoResolved = resolve(repoRoot);
  const paths = new Set(extraPaths.filter(Boolean));
  const folder = sanitizeBranchFolderName(branchName);

  let branchTip = null;
  try {
    branchTip = await runGit(["rev-parse", branchName], repoRoot);
  } catch {
    // not a local branch ref — still try path-based removal
  }

  for (const tree of await listWorktrees(repoRoot)) {
    if (tree.branch === branchName) paths.add(tree.path);
    if (branchTip && tree.head === branchTip) paths.add(tree.path);
    if (worktreePathMatchesTarget(tree.path, branchName)) paths.add(tree.path);
    const normalized = tree.path.replace(/\\/g, "/");
    if (normalized.includes(`/${folder}`) || normalized.endsWith(`/${folder}`)) {
      paths.add(tree.path);
    }
  }

  let removedCount = 0;
  const failures = [];

  for (const worktreePath of paths) {
    if (resolve(worktreePath) === repoResolved) continue;
    try {
      await runGit(["worktree", "remove", "--force", worktreePath], repoRoot);
      removedCount += 1;
    } catch (error) {
      failures.push({ path: worktreePath, error: error?.message || String(error) });
    }
  }

  await runGit(["worktree", "prune"], repoRoot).catch(() => {});
  return { removedCount, failures };
}

/** Permanently delete a local branch and its compare worktrees; returns fresh overview. */
export async function deleteBranchFromRepo(repoRoot, targetId) {
  const result = await deleteComparisonTarget(repoRoot, targetId);
  const overview = await loadRepoOverview(repoRoot);
  return { ...result, overview };
}

export async function deleteComparisonTarget(repoRoot, targetId, worktreePath) {
  if (targetId === "main") {
    throw new Error("Cannot delete the main branch.");
  }

  if (targetId === "working-copy") {
    const { discarded } = await discardWorkingCopyChanges(repoRoot);
    return {
      deletedBranch: false,
      removedWorktrees: 0,
      discardedWorkingCopy: discarded,
      targetId,
    };
  }

  const branchName = await resolveDeletionTargetId(repoRoot, targetId);
  const extraPaths = [
    ...(worktreePath ? [worktreePath] : []),
    ...compareWorktreePaths(repoRoot, branchName),
    ...compareWorktreePaths(repoRoot, targetId),
  ];

  const { removedCount, failures } = await removeWorktreesForBranch(repoRoot, branchName, {
    extraPaths,
  });

  let deletedBranch = false;
  const localRaw = await runGit(["branch", "--format=%(refname:short)"], repoRoot).catch(() => "");
  const localBranches = localRaw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  if (localBranches.includes(branchName)) {
    try {
      await runGit(["branch", "-D", branchName], repoRoot);
      deletedBranch = true;
    } catch (error) {
      const stillListed = (await runGit(["branch", "--format=%(refname:short)"], repoRoot).catch(() => ""))
        .split(/\r?\n/)
        .map((line) => line.trim())
        .includes(branchName);
      if (stillListed) {
        throw new Error(
          `Could not delete branch "${branchName}": ${error?.message || String(error)}. ` +
            (failures.length
              ? `Worktree cleanup issues: ${failures.map((f) => f.path).join(", ")}`
              : "Stop any dev servers using that branch and try again."),
        );
      }
    }
  } else if (branchName === targetId && !branchName.startsWith("origin/")) {
    throw new Error(
      `No local branch named "${branchName}" to delete. ` +
        (targetId !== branchName ? `(Resolved from commit ${targetId.slice(0, 7)}.) ` : "") +
        "Remote-only refs cannot be removed with Reject.",
    );
  }

  return {
    deletedBranch,
    removedWorktrees: removedCount,
    targetId: branchName,
    worktreeFailures: failures,
  };
}
