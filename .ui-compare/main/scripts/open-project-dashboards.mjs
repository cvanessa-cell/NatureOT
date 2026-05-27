/**
 * Open TreeTots project dashboards: GitHub, Sanity, Vercel, and the live site.
 * Checks CLI auth where possible; use --login to start interactive logins.
 *
 * Usage:
 *   node --env-file=.env.local scripts/open-project-dashboards.mjs
 *   node --env-file=.env.local scripts/open-project-dashboards.mjs --login
 *   node --env-file=.env.local scripts/open-project-dashboards.mjs --no-open
 */

import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import { loadProjectContext, root } from "./lib/project-context.mjs";
import {
  isSanityLoggedIn,
  sanityCliBin,
  sanityLoginLabel,
} from "./lib/sanity-cli-auth.mjs";

const args = new Set(process.argv.slice(2));
const doLogin = args.has("--login");
const skipOpen = args.has("--no-open");

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

function resolveGitRemote() {
  const remote = tryRun("git remote get-url origin");
  if (!remote.ok) return null;
  const url = remote.out.trim();
  const https = url
    .replace(/^git@github\.com:/, "https://github.com/")
    .replace(/\.git$/, "");
  return https;
}

async function checkVercelUser() {
  const r = tryRun("npx.cmd --yes vercel@53 whoami");
  if (!r.ok) {
    const r2 = tryRun("npx --yes vercel@53 whoami");
    return r2.ok ? r2.out.trim() : null;
  }
  return r.out.trim();
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

function loginVercel() {
  console.log("\n→ Vercel: starting interactive login (browser)…");
  const child = spawn("npx.cmd --yes vercel@53 login", {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
  return new Promise((resolve) => child.on("close", (code) => resolve(code === 0)));
}

function loginSanity() {
  if (isSanityLoggedIn() && !doLogin) return true;
  console.log("\n→ Sanity: starting CLI login (browser)…");
  console.log("   Run manually anytime: npm run sanity:login\n");
  try {
    run(`node "${sanityCliBin}" login`, { silent: false });
    return isSanityLoggedIn();
  } catch {
    return false;
  }
}

function loginGitHub() {
  const gh = tryRun("gh --version");
  if (!gh.ok) {
    console.log("→ GitHub CLI (gh) not installed. Open https://github.com/login in browser.");
    openUrl("https://github.com/login");
    return;
  }
  const status = tryRun("gh auth status");
  if (status.ok && !doLogin) return;
  console.log("\n→ GitHub: starting `gh auth login` (interactive)…");
  try {
    run("gh auth login", { silent: false });
  } catch {
    openUrl("https://github.com/login");
  }
}

async function main() {
  const ctx = loadProjectContext();
  ctx.urls.githubRepo = resolveGitRemote();

  console.log("TreeTots Nature OT — project dashboards\n");
  console.log(`  Repo root:     ${root}`);
  console.log(`  Live site:     ${ctx.appUrl}`);
  console.log(`  Studio:        ${ctx.studioUrl}`);
  console.log(`  Sanity:        ${ctx.sanityProjectId || "(set NEXT_PUBLIC_SANITY_PROJECT_ID)"}`);
  console.log(`  Vercel:        ${ctx.vercelProjectName} (${ctx.vercelProjectId || "not linked"})`);

  const gitBranch = tryRun("git branch --show-current");
  if (gitBranch.ok) console.log(`  Git branch:    ${gitBranch.out.trim()}`);

  const vercelUser = await checkVercelUser();
  const sanityLoggedIn = isSanityLoggedIn();
  console.log(`\n  Vercel CLI:    ${vercelUser ? `logged in as ${vercelUser}` : "not logged in"}`);
  console.log(
    `  Sanity CLI:    ${sanityLoggedIn ? sanityLoginLabel() || "logged in" : "not logged in (npm run sanity:login)"}`,
  );
  const ghStatus = tryRun("gh auth status");
  console.log(`  GitHub CLI:    ${ghStatus.ok ? "authenticated" : "not logged in / gh missing"}`);

  if (doLogin) {
    if (!sanityLoggedIn) loginSanity();
    if (!vercelUser) await loginVercel();
    loginGitHub();
  } else if (!vercelUser || !sanityLoggedIn) {
    console.log("\n  Tip: run with --login for Sanity/Vercel/GitHub CLI auth, or npm run sanity:login");
  }

  const productionUrl = await fetchProductionUrl(ctx);
  const openList = [
    ["Live website", productionUrl],
    ["Sanity Studio", ctx.studioUrl],
    ["Sanity manage", ctx.urls.sanityManage],
    ["Vercel project", ctx.urls.vercelProject],
    ["Vercel deployments", ctx.urls.vercelDeployments],
    ["GitHub repo", ctx.urls.githubRepo],
  ].filter(([, url]) => url);

  console.log("\nOpening in browser:\n");
  for (const [label, url] of openList) {
    console.log(`  • ${label}: ${url}`);
    openUrl(url);
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
