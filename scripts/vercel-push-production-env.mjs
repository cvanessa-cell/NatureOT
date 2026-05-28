/**
 * Push production-critical env from .env.local to Vercel (production + preview).
 * Usage: node --env-file=.env.local scripts/vercel-push-production-env.mjs
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

const PROJECT_ID = "prj_C8zrQUJg8zWsnyZziGXuY0tiDzid";
const TEAM_ID = "team_W9utMnJAj6nAFr98LzVLP0ds";
const TARGETS = ["production", "preview"];

/** Keys to sync; type is Vercel env type. */
const KEYS = [
  { name: "NEXT_PUBLIC_APP_URL", type: "plain" },
  { name: "ADMIN_EMAILS", type: "plain" },
  { name: "NEXT_PUBLIC_SUPABASE_URL", type: "plain" },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", type: "plain" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", type: "sensitive" },
  { name: "RESEND_API_KEY", type: "sensitive" },
  { name: "EMAIL_FROM", type: "plain" },
  { name: "EMAIL_DRY_RUN", type: "plain" },
  { name: "CRON_SECRET", type: "sensitive" },
  { name: "NEXT_PUBLIC_BOOKING_URL", type: "plain" },
  { name: "NEXT_PUBLIC_BOOKING_EMBED_URL", type: "plain" },
  { name: "STRIPE_SECRET_KEY", type: "sensitive" },
  { name: "STRIPE_WEBHOOK_SECRET", type: "sensitive" },
  { name: "NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_DROPIN", type: "plain" },
  { name: "NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_6_PASS", type: "plain" },
  { name: "NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_SINGLE", type: "plain" },
  { name: "NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_6_WEEK", type: "plain" },
  { name: "NEXT_PUBLIC_STRIPE_PRICE_REFLEX_INTENSIVE", type: "plain" },
  { name: "AIRTABLE_API_KEY", type: "sensitive" },
  { name: "AIRTABLE_BASE_ID", type: "plain" },
  { name: "AIRTABLE_SYNC_ENABLED", type: "plain" },
  { name: "AIRTABLE_DRY_RUN", type: "plain" },
  { name: "AIRTABLE_LEADS_TABLE_ID", type: "plain" },
  { name: "AIRTABLE_WORKSHOP_REGISTRATIONS_TABLE_ID", type: "plain" },
  { name: "AIRTABLE_REFERRAL_INQUIRIES_TABLE_ID", type: "plain" },
  { name: "AIRTABLE_REFERRAL_PARTNERS_TABLE_ID", type: "plain" },
  { name: "AIRTABLE_WAITLIST_TABLE_ID", type: "plain" },
  { name: "AIRTABLE_WORKSHOPS_TABLE_ID", type: "plain" },
  { name: "AIRTABLE_CONTENT_CALENDAR_TABLE_ID", type: "plain" },
  { name: "AIRTABLE_LOCAL_SEO_PAGES_TABLE_ID", type: "plain" },
  { name: "AIRTABLE_SEO_PAGES_TABLE_ID", type: "plain" },
  { name: "AIRTABLE_TESTIMONIALS_TABLE_ID", type: "plain" },
  { name: "AGENT_AIRTABLE_ENABLED", type: "plain" },
  { name: "AGENT_WORKER_BASE_URL", type: "plain" },
  { name: "NEXT_PUBLIC_SANITY_PROJECT_ID", type: "plain" },
  { name: "NEXT_PUBLIC_SANITY_DATASET", type: "plain" },
  { name: "SANITY_API_READ_TOKEN", type: "sensitive" },
  { name: "NEXT_PUBLIC_META_PIXEL_ID", type: "plain" },
  { name: "META_ACCESS_TOKEN", type: "sensitive" },
  { name: "META_CAPI_ENABLED", type: "plain" },
  { name: "META_CAPI_DRY_RUN", type: "plain" },
  { name: "PARENT_GUIDE_DELIVERY_MODE", type: "plain" },
  { name: "PARENT_GUIDE_PUBLIC_ASSET_PATH", type: "plain" },
  { name: "ZAPIER_ENABLED", type: "plain" },
  { name: "ZAPIER_DRY_RUN", type: "plain" },
  { name: "ZAPIER_WEBHOOK_SECRET", type: "sensitive" },
  { name: "ZAPIER_NEW_LEAD_WEBHOOK_URL", type: "plain" },
  { name: "SLACK_ENABLED", type: "plain" },
  { name: "SLACK_DRY_RUN", type: "plain" },
  { name: "SLACK_WEBHOOK_URL", type: "sensitive" },
];

const SKIP_IF_EMPTY = new Set(["OPENAI_API_KEY", "OPENAI_BASE_URL"]);

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

async function listVercelEnvs({ projectId, teamId, bearer }) {
  const u = new URL(
    `https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}/env`,
  );
  u.searchParams.set("teamId", teamId);
  const res = await fetch(u, {
    headers: { Authorization: `Bearer ${bearer}` },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Vercel list env ${res.status}: ${text.slice(0, 400)}`);
  }
  return JSON.parse(text).envs ?? [];
}

async function upsertVercelEnv({
  projectId,
  teamId,
  bearer,
  key,
  value,
  type,
  target,
  existingByKeyTarget,
}) {
  const existing = existingByKeyTarget.get(`${key}\0${target}`);
  if (existing?.id) {
    const resolvedType = existing.type ?? type;
    const u = new URL(
      `https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}/env/${existing.id}`,
    );
    u.searchParams.set("teamId", teamId);
    const res = await fetch(u, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${bearer}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value, type: resolvedType, target: [target] }),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(
        `Vercel PATCH ${res.status} for ${key}@${target}: ${text.slice(0, 400)}`,
      );
    }
    return;
  }

  const u = new URL(
    `https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/env`,
  );
  u.searchParams.set("teamId", teamId);

  const res = await fetch(u, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearer}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key, value, type, target: [target] }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Vercel POST ${res.status} for ${key}@${target}: ${text.slice(0, 400)}`);
  }
}

async function main() {
  if (!fs.existsSync(envPath)) {
    console.error(`Missing ${path.relative(root, envPath)}`);
    process.exit(1);
  }

  const fileEnv = parseEnvFile(fs.readFileSync(envPath, "utf8"));
  const bearer = loadVercelToken(fileEnv);
  if (!bearer) {
    console.error("No Vercel token (VERCEL_TOKEN or vercel login).");
    process.exit(1);
  }

  // Ensure both admin emails even if .env.local has a duplicate single-email line later.
  fileEnv.ADMIN_EMAILS =
    "cvanessa@treetotsnatureot.com,cvanessa13@gmail.com";

  const existingEnvs = await listVercelEnvs({
    projectId: PROJECT_ID,
    teamId: TEAM_ID,
    bearer,
  });
  const existingByKeyTarget = new Map();
  for (const row of existingEnvs) {
    for (const target of row.target ?? []) {
      existingByKeyTarget.set(`${row.key}\0${target}`, row);
    }
  }

  let synced = 0;
  let skipped = 0;

  for (const { name, type } of KEYS) {
    const value = fileEnv[name]?.trim();
    if (!value) {
      if (!SKIP_IF_EMPTY.has(name)) {
        console.warn(`⚠ skip ${name} (empty in .env.local)`);
      }
      skipped += 1;
      continue;
    }
    for (const target of TARGETS) {
      process.stdout.write(`→ ${name} → ${target} … `);
      await upsertVercelEnv({
        projectId: PROJECT_ID,
        teamId: TEAM_ID,
        bearer,
        key: name,
        value,
        type,
        target,
        existingByKeyTarget,
      });
      console.log("✓");
      synced += 1;
    }
  }

  console.log(
    `\n✅ Synced ${synced} env entries (${KEYS.length} keys × ${TARGETS.length} targets, ${skipped} skipped). Redeploy production for changes to go live.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
