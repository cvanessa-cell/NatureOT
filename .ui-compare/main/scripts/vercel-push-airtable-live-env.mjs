/**
 * Push live Airtable + cron env to linked Vercel project (production + preview).
 * Usage: node --env-file=.env.local scripts/vercel-push-airtable-live-env.mjs
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
  { name: "AIRTABLE_SYNC_ENABLED", type: "plain" },
  { name: "AIRTABLE_DRY_RUN", type: "plain" },
  { name: "CRON_SECRET", type: "sensitive" },
  { name: "AIRTABLE_LEADS_TABLE_ID", type: "plain" },
  { name: "AIRTABLE_WORKSHOP_REGISTRATIONS_TABLE_ID", type: "plain" },
  { name: "AIRTABLE_REFERRAL_INQUIRIES_TABLE_ID", type: "plain" },
  { name: "AIRTABLE_LOCAL_SEO_PAGES_TABLE_ID", type: "plain" },
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
      /* try next */
    }
  }
  return null;
}

async function upsertVercelEnv({ projectId, teamId, bearer, key, value, type, target }) {
  const u = new URL(
    `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/env`,
  );
  u.searchParams.set("teamId", teamId);
  u.searchParams.set("upsert", "true");

  const res = await fetch(u, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearer}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key, value, type, target: [target] }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Vercel API ${res.status}: ${text.slice(0, 500)}`);
}

async function main() {
  if (!fs.existsSync(envPath)) {
    console.error(`Missing ${path.relative(root, envPath)}`);
    process.exit(1);
  }
  if (!fs.existsSync(vercelMetaPath)) {
    console.error("Missing .vercel/project.json — run: npm run vercel:link");
    process.exit(1);
  }

  const fileEnv = parseEnvFile(fs.readFileSync(envPath, "utf8"));
  const bearer = loadVercelToken(fileEnv);
  if (!bearer) {
    console.error("No Vercel token (VERCEL_TOKEN or vercel login).");
    process.exit(1);
  }

  const { projectId, orgId: teamId } = JSON.parse(
    fs.readFileSync(vercelMetaPath, "utf8"),
  );

  for (const { name, type } of KEYS) {
    const value = fileEnv[name]?.trim();
    if (!value) {
      console.error(`Missing ${name} in .env.local`);
      process.exit(1);
    }
    for (const target of TARGETS) {
      console.log(`→ ${name} → ${target}`);
      await upsertVercelEnv({ projectId, teamId, bearer, key: name, value, type, target });
      console.log("   ✓");
    }
  }

  console.log(
    "\n✅ Live Airtable env (flags, CRON_SECRET, table IDs) synced to Vercel. Redeploy production to apply.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
