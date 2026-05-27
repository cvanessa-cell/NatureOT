/**
 * Verify Sanity env vars exist on the linked Vercel project (production + preview).
 *
 * Usage: node --env-file=.env.local scripts/vercel-verify-sanity-env.mjs
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const vercelMetaPath = path.join(root, ".vercel", "project.json");

const REQUIRED = [
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "SANITY_API_READ_TOKEN",
];

const TARGETS = ["production", "preview"];

function vercelAuthFilePaths() {
  const paths = [path.join(os.homedir(), ".vercel", "auth.json")];
  if (process.env.APPDATA) {
    paths.push(
      path.join(process.env.APPDATA, "com.vercel.cli", "Data", "auth.json"),
    );
  }
  return paths;
}

function loadVercelToken() {
  if (process.env.VERCEL_TOKEN?.trim()) return process.env.VERCEL_TOKEN.trim();
  for (const authPath of vercelAuthFilePaths()) {
    if (!fs.existsSync(authPath)) continue;
    try {
      const auth = JSON.parse(fs.readFileSync(authPath, "utf8"));
      if (auth.token?.trim()) return auth.token.trim();
    } catch {
      /* try next path */
    }
  }
  return null;
}

async function listProjectEnv(projectId, teamId, bearer) {
  const u = new URL(
    `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/env`
  );
  u.searchParams.set("teamId", teamId);
  const res = await fetch(u, {
    headers: { Authorization: `Bearer ${bearer}` },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Vercel API ${res.status}: ${text.slice(0, 400)}`);
  const json = JSON.parse(text);
  return json.envs ?? json;
}

function targetsForEnv(entry) {
  const t = entry.target;
  if (Array.isArray(t)) return t;
  if (typeof t === "string") return [t];
  return [];
}

async function main() {
  if (!fs.existsSync(vercelMetaPath)) {
    console.error("Missing .vercel/project.json — run: npm run vercel:link");
    process.exit(1);
  }
  const token = loadVercelToken();
  if (!token) {
    console.error(
      "No Vercel token. Run `vercel login` or set VERCEL_TOKEN in .env.local (https://vercel.com/account/tokens)."
    );
    process.exit(1);
  }

  const { projectId, orgId: teamId, projectName } = JSON.parse(
    fs.readFileSync(vercelMetaPath, "utf8")
  );
  const envs = await listProjectEnv(projectId, teamId, token);

  console.log(`Project: ${projectName ?? projectId}\n`);

  let allOk = true;
  for (const target of TARGETS) {
    console.log(`[${target}]`);
    for (const key of REQUIRED) {
      const hit = envs.find(
        (e) => e.key === key && targetsForEnv(e).includes(target)
      );
      if (hit) {
        console.log(`  ✓ ${key}`);
      } else {
        console.log(`  ✗ ${key} — missing`);
        allOk = false;
      }
    }
    console.log("");
  }

  if (allOk) {
    console.log("✅ All Sanity variables are set on Vercel for production and preview.");
    process.exit(0);
  }
  console.log(
    "Run: node --env-file=.env.local scripts/vercel-push-sanity-env.mjs\nThen redeploy on Vercel."
  );
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
