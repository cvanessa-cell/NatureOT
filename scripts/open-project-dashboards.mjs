/**
 * Open project dashboards from .env / .env.local and audit CLI auth.
 * Use --login for interactive CLI / browser token flows.
 *
 * Usage:
 *   node --env-file=.env.local scripts/open-project-dashboards.mjs
 *   node --env-file=.env.local scripts/open-project-dashboards.mjs --login
 *   node --env-file=.env.local scripts/open-project-dashboards.mjs --no-open
 *   node --env-file=.env.local scripts/open-project-dashboards.mjs --auth-only
 */

import { execSync, spawn } from "node:child_process";
import { loadProjectContext, root } from "./lib/project-context.mjs";
import { collectEnvIntegrationUrls } from "./lib/env-integration-urls.mjs";
import {
  auditIntegrationAuth,
  buildIntegrationAuthPlan,
  printAuthAudit,
  runIntegrationLogins,
} from "./lib/integration-cli-auth.mjs";

const args = new Set(process.argv.slice(2));
const doLogin = args.has("--login");
const skipOpen = args.has("--no-open");
const authOnly = args.has("--auth-only");

function run(cmd, opts = {}) {
  return execSync(cmd, {
    cwd: root,
    encoding: "utf8",
    stdio: opts.silent ? "pipe" : "inherit",
    shell: true,
    windowsHide: true,
    ...opts,
  }).trim();
}

function tryRun(cmd) {
  try {
    return { ok: true, out: run(cmd, { silent: true }) };
  } catch (err) {
    return { ok: false, err };
  }
}

function openUrl(url) {
  if (!url || skipOpen) return;
  const platform = process.platform;
  if (platform === "win32") {
    run(`start "" "${url.replace(/"/g, '\\"')}"`, { silent: false });
  } else if (platform === "darwin") {
    run(`open "${url}"`, { silent: false });
  } else {
    run(`xdg-open "${url}"`, { silent: false });
  }
}

function spawnInteractive(cmd) {
  return new Promise((resolve) => {
    const child = spawn(cmd, { cwd: root, stdio: "inherit", shell: true });
    child.on("close", (code) => resolve(code === 0));
  });
}

function resolveGitRemote() {
  const remote = tryRun("git remote get-url origin");
  if (!remote.ok) return null;
  const url = remote.out.trim();
  return url
    .replace(/^git@github\.com:/, "https://github.com/")
    .replace(/\.git$/, "");
}

async function fetchProductionUrl(ctx) {
  if (!ctx.vercelToken || !ctx.vercelProjectId || !ctx.vercelTeamId) {
    return ctx.appUrl;
  }
  const u = new URL(
    `https://api.vercel.com/v6/deployments?projectId=${encodeURIComponent(ctx.vercelProjectId)}&target=production&limit=1`,
  );
  u.searchParams.set("teamId", ctx.vercelTeamId);
  const res = await fetch(u, {
    headers: { Authorization: `Bearer ${ctx.vercelToken}` },
  });
  if (!res.ok) return ctx.appUrl;
  const json = await res.json();
  const dep = json.deployments?.[0];
  const alias = dep?.alias?.find((a) => !a.includes(".vercel.app"));
  if (alias) return `https://${alias}`;
  return ctx.appUrl;
}

async function main() {
  const ctx = loadProjectContext();
  ctx.urls.githubRepo = resolveGitRemote();

  const hasGit = Boolean(ctx.urls.githubRepo || tryRun("git rev-parse --is-inside-work-tree").ok);

  console.log("TreeTots Nature OT — open project\n");
  console.log(`  Repo root:     ${root}`);
  console.log(`  Live site:     ${ctx.appUrl}`);
  console.log(`  Sanity:        ${ctx.sanityProjectId || "(set NEXT_PUBLIC_SANITY_PROJECT_ID)"}`);
  console.log(`  Vercel:        ${ctx.vercelProjectName} (${ctx.vercelProjectId || "not linked"})`);

  const gitBranch = tryRun("git branch --show-current");
  if (gitBranch.ok) console.log(`  Git branch:    ${gitBranch.out.trim()}`);

  const authPlan = buildIntegrationAuthPlan(ctx.env, { hasGitRepo: hasGit });
  const authResults = auditIntegrationAuth(authPlan, tryRun, ctx.env);
  printAuthAudit(authResults);

  if (!doLogin && authResults.some((r) => !r.authenticated)) {
    console.log("\n  Tip: npm run project:login  (or add --login) for CLI / token auth flows");
  }

  await runIntegrationLogins(authResults, {
    doLogin,
    tryRun,
    run,
    openUrl,
    spawnInteractive,
    root,
  });

  if (authOnly) {
    console.log("\nDone (--auth-only, skipped opening dashboards).");
    return;
  }

  const productionUrl = await fetchProductionUrl(ctx);
  const openList = [
    ["Live website", productionUrl],
    ["GitHub repo", ctx.urls.githubRepo],
    ...collectEnvIntegrationUrls(ctx.env, ctx).map(({ label, url }) => [label, url]),
  ].filter(([, url]) => url);

  const deduped = [];
  const seen = new Set();
  for (const [label, url] of openList) {
    if (seen.has(url)) continue;
    seen.add(url);
    deduped.push([label, url]);
  }

  console.log(`\nOpening ${deduped.length} tab(s) from .env / .env.local:\n`);
  for (const [label, url] of deduped) {
    console.log(`  • ${label}: ${url}`);
    openUrl(url);
  }

  if (deduped.length === 0) {
    console.log("  (none — copy .env.example → .env.local and fill integration IDs/keys)");
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
