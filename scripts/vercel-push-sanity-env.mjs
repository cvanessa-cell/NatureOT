/**
 * Push Sanity-related env vars from .env.local to the linked Vercel project
 * (Production + Preview) via the REST API — avoids Vercel CLI hangs under Node on Windows.
 *
 * Token: VERCEL_TOKEN in .env.local, or ~/.vercel/auth.json after `vercel login`.
 *
 * Usage: node --env-file=.env.local scripts/vercel-push-sanity-env.mjs
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");
const vercelMetaPath = path.join(root, ".vercel", "project.json");

const KEYS = [
  { name: "NEXT_PUBLIC_SANITY_PROJECT_ID", type: "plain" },
  { name: "NEXT_PUBLIC_SANITY_DATASET", type: "plain" },
  { name: "SANITY_API_READ_TOKEN", type: "sensitive" },
];

const TARGETS = ["production", "preview"];

function parseEnvFile(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function vercelAuthFilePaths() {
  const paths = [path.join(os.homedir(), ".vercel", "auth.json")];
  if (process.env.APPDATA) {
    paths.push(
      path.join(process.env.APPDATA, "com.vercel.cli", "Data", "auth.json"),
    );
  }
  if (process.env.XDG_CONFIG_HOME) {
    paths.push(path.join(process.env.XDG_CONFIG_HOME, "com.vercel.cli", "auth.json"));
  }
  return paths;
}

function loadVercelToken(parsedEnv) {
  const fromEnv =
    parsedEnv.VERCEL_TOKEN?.trim() || process.env.VERCEL_TOKEN?.trim();
  if (fromEnv) return fromEnv;
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

async function upsertVercelEnv({
  projectId,
  teamId,
  bearer,
  key,
  value,
  type,
  target,
}) {
  const u = new URL(
    `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/env`
  );
  u.searchParams.set("teamId", teamId);
  u.searchParams.set("upsert", "true");

  const res = await fetch(u, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearer}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      value,
      type,
      target: [target],
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Vercel API ${res.status}: ${text.slice(0, 500)}`);
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return;
  }
  const failed = json?.failed;
  if (Array.isArray(failed) && failed.length > 0) {
    throw new Error(
      `Vercel API rejected env: ${JSON.stringify(failed).slice(0, 400)}`
    );
  }
  return json;
}

async function main() {
  if (!fs.existsSync(envPath)) {
    console.error(`Missing ${path.relative(root, envPath)}`);
    process.exit(1);
  }
  if (!fs.existsSync(vercelMetaPath)) {
    console.error(
      `Missing ${path.relative(root, vercelMetaPath)} — run: npm run vercel:link`
    );
    process.exit(1);
  }

  const fileEnv = parseEnvFile(fs.readFileSync(envPath, "utf8"));
  const vToken = loadVercelToken(fileEnv);
  if (!vToken) {
    console.error(
      "No Vercel token: add VERCEL_TOKEN to .env.local or run `vercel login` (writes ~/.vercel/auth.json)."
    );
    process.exit(1);
  }

  const { projectId, orgId: teamId } = JSON.parse(
    fs.readFileSync(vercelMetaPath, "utf8")
  );
  if (!projectId || !teamId) {
    console.error(".vercel/project.json must include projectId and orgId.");
    process.exit(1);
  }

  for (const { name, type } of KEYS) {
    const value = fileEnv[name]?.trim();
    if (!value) {
      console.error(`Missing ${name} in .env.local`);
      process.exit(1);
    }
    for (const target of TARGETS) {
      console.log(`\n→ ${name} → ${target}`);
      const out = await upsertVercelEnv({
        projectId,
        teamId,
        bearer: vToken,
        key: name,
        value,
        type,
        target,
      });
      const created = out?.created;
      if (Array.isArray(created)) {
        console.log(`   ✓ upserted (${created.map((c) => c.key).join(", ")})`);
      } else if (created?.key) {
        console.log(`   ✓ upserted (${created.key})`);
      } else {
        console.log("   ✓ upserted");
      }
    }
  }

  console.log(
    "\n✅ Sanity env vars synced to Vercel (production + preview). Trigger a redeploy to use them."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
