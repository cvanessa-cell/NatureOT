#!/usr/bin/env node
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import {
  loadRepoOverview,
  commitChanges,
  listRecentCommits,
  deleteBranchFromRepo,
  runGit,
} from "./lib/git-info.mjs";
import {
  applyDecision,
  getSession,
  replaceSideTarget,
  serializeSession,
  startComparison,
  stopSession,
} from "./lib/orchestrator.mjs";
import { buildRouteComparison } from "./lib/diff-annotate.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC_DIR = join(__dirname, "public");
const PORT = Number(process.env.UI_COMPARE_PORT || 3140);

const routeCache = new Map();

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      try {
        resolveBody(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function contentType(filePath) {
  const ext = extname(filePath).toLowerCase();
  const map = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".png": "image/png",
    ".json": "application/json; charset=utf-8",
  };
  return map[ext] || "application/octet-stream";
}

function serveStatic(res, filePath) {
  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": contentType(filePath) });
  res.end(readFileSync(filePath));
}

function openBrowser(url) {
  const cmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["", url] : [url];
  spawn(cmd, args, { shell: true, stdio: "ignore", detached: true }).unref();
}

async function getRepoRoot() {
  return runGit(["rev-parse", "--show-toplevel"], process.cwd());
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    const { pathname } = url;

    if (req.method === "GET" && pathname === "/api/repo") {
      const repoRoot = await getRepoRoot();
      return sendJson(res, 200, await loadRepoOverview(repoRoot));
    }

    if (req.method === "GET" && pathname === "/api/repo/targets") {
      const repoRoot = await getRepoRoot();
      const overview = await loadRepoOverview(repoRoot);
      const commits = await listRecentCommits(repoRoot);
      return sendJson(res, 200, { ...overview, commits });
    }

    if (req.method === "POST" && pathname === "/api/commit") {
      const repoRoot = await getRepoRoot();
      const body = await readBody(req);
      const overview = await commitChanges(repoRoot, { message: body.message });
      return sendJson(res, 200, { ok: true, overview });
    }

    if (req.method === "POST" && pathname === "/api/repo/delete-branch") {
      const repoRoot = await getRepoRoot();
      const body = await readBody(req);
      const branchId = body.branchId || body.targetId;
      if (!branchId) return sendJson(res, 400, { error: "branchId is required" });
      const result = await deleteBranchFromRepo(repoRoot, branchId);
      return sendJson(res, 200, { ok: true, ...result });
    }

    if (req.method === "POST" && pathname === "/api/compare/start") {
      const repoRoot = await getRepoRoot();
      const body = await readBody(req);
      const session = await startComparison(repoRoot, {
        leftId: body.leftId,
        rightId: body.rightId,
        routes: body.routes,
      });
      const full = getSession(session.id);
      full.cacheDir = join(repoRoot, "ui-diff-report", "ui-compare-sessions", session.id);
      mkdirSync(full.cacheDir, { recursive: true });
      const compareUrl = `http://127.0.0.1:${PORT}/compare.html?session=${session.id}`;
      if (body.openBrowser !== false) openBrowser(compareUrl);
      return sendJson(res, 200, { session, compareUrl });
    }

    const decisionMatch = pathname.match(/^\/api\/compare\/session\/([^/]+)\/decision$/);
    if (req.method === "POST" && decisionMatch) {
      const body = await readBody(req);
      const result = await applyDecision(decisionMatch[1], {
        side: body.side,
        action: body.action,
      });
      return sendJson(res, 200, result);
    }

    const replaceMatch = pathname.match(/^\/api\/compare\/session\/([^/]+)\/replace-with$/);
    if (req.method === "POST" && replaceMatch) {
      const body = await readBody(req);
      const result = await replaceSideTarget(replaceMatch[1], {
        side: body.side,
        targetId: body.targetId,
      });
      return sendJson(res, 200, result);
    }

    const sessionMatch = pathname.match(/^\/api\/compare\/session\/([^/]+)$/);
    if (req.method === "GET" && sessionMatch) {
      const session = getSession(sessionMatch[1]);
      if (!session) return sendJson(res, 404, { error: "Session not found" });
      return sendJson(res, 200, { session: serializeSession(session) });
    }

    const routeMatch = pathname.match(/^\/api\/compare\/session\/([^/]+)\/route$/);
    if (req.method === "GET" && routeMatch) {
      const session = getSession(routeMatch[1]);
      if (!session) return sendJson(res, 404, { error: "Session not found" });
      const route = url.searchParams.get("path") || "/";
      const leftLiveUrl = session.left?.url ? `${session.left.url}${route}` : null;
      const rightLiveUrl = session.right?.url ? `${session.right.url}${route}` : null;

      if (url.searchParams.get("analyze") !== "1") {
        return sendJson(res, 200, {
          route,
          leftLiveUrl,
          rightLiveUrl,
          leftLabel: session.left.label,
          rightLabel: session.right.label,
          sessionId: session.id,
          keptSide: session.keptSide,
        });
      }

      if (!session.left?.url || !session.right?.url) {
        return sendJson(res, 400, { error: "Both panes must be active to analyze differences." });
      }

      const cacheKey = `${session.id}:${route}`;
      if (!routeCache.has(cacheKey)) {
        const result = await buildRouteComparison({
          leftUrl: session.left.url,
          rightUrl: session.right.url,
          route,
          cacheDir: session.cacheDir,
        });
        result.leftLiveUrl = leftLiveUrl;
        result.rightLiveUrl = rightLiveUrl;
        result.leftLabel = session.left.label;
        result.rightLabel = session.right.label;
        result.sessionId = session.id;
        routeCache.set(cacheKey, result);
      }
      return sendJson(res, 200, routeCache.get(cacheKey));
    }

    const fileMatch = pathname.match(/^\/api\/compare\/session\/([^/]+)\/file\/([^/]+)$/);
    if (req.method === "GET" && fileMatch) {
      const session = getSession(fileMatch[1]);
      if (!session) return sendJson(res, 404, { error: "Session not found" });
      const filePath = join(session.cacheDir, fileMatch[2]);
      if (!filePath.startsWith(session.cacheDir)) return sendJson(res, 403, { error: "Forbidden" });
      return serveStatic(res, filePath);
    }

    const stopMatch = pathname.match(/^\/api\/compare\/session\/([^/]+)\/stop$/);
    if (req.method === "POST" && stopMatch) {
      stopSession(stopMatch[1]);
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
      return serveStatic(res, join(PUBLIC_DIR, "index.html"));
    }
    if (req.method === "GET" && pathname === "/compare.html") {
      return serveStatic(res, join(PUBLIC_DIR, "compare.html"));
    }
    if (req.method === "GET" && pathname.startsWith("/assets/")) {
      return serveStatic(res, join(PUBLIC_DIR, pathname));
    }

    res.writeHead(404);
    res.end("Not found");
  } catch (error) {
    sendJson(res, 500, { error: error?.message || String(error) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  const dashboardUrl = `http://127.0.0.1:${PORT}/`;
  console.log(`UI Compare dashboard: ${dashboardUrl}`);
  openBrowser(dashboardUrl);
});

process.on("SIGINT", () => process.exit(0));
