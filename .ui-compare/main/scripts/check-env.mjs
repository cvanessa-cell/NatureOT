/**
 * Loads `.env.local` (if present) and prints a masked integration checklist.
 * Run: npm run env:check
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envLocalPath = path.join(root, ".env.local");

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

function mergeEnv(parsed) {
  for (const [k, v] of Object.entries(parsed)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

function set(key, val) {
  if (process.env[key] === undefined) process.env[key] = val;
}

function mask(key, val) {
  if (!val || !String(val).trim()) return "(empty)";
  const s = String(val);
  const sensitive =
    /SECRET|KEY|TOKEN|PASSWORD|PAT|SID|AUTH|BASE_ID/i.test(key) ||
    key.includes("SUPABASE_") ||
    key === "NEXT_PUBLIC_APP_URL" ||
    /_URL$/.test(key);
  if (sensitive && s.length > 4) return `${s.slice(0, 3)}…${s.slice(-2)} (${s.length} chars)`;
  return s.length > 64 ? `${s.slice(0, 40)}…` : s;
}

function boolOk(name) {
  const v = process.env[name];
  return Boolean(v && String(v).trim() !== "");
}

function isTrue(name) {
  return process.env[name] === "true";
}

if (fs.existsSync(envLocalPath)) {
  mergeEnv(parseEnvFile(fs.readFileSync(envLocalPath, "utf8")));
  console.log(`Using variables from ${path.relative(root, envLocalPath)}\n`);
} else {
  console.log(
    `No .env.local found. Copy .env.example → .env.local and re-run.\n`
  );
}

// Defaults used by Next when unset — mirror operational-readiness enough for CLI
set("EMAIL_DRY_RUN", process.env.EMAIL_DRY_RUN ?? "");
set("ZAPIER_ENABLED", process.env.ZAPIER_ENABLED ?? "");
set("ZAPIER_DRY_RUN", process.env.ZAPIER_DRY_RUN ?? "");
set("AIRTABLE_SYNC_ENABLED", process.env.AIRTABLE_SYNC_ENABLED ?? "");
set("AIRTABLE_DRY_RUN", process.env.AIRTABLE_DRY_RUN ?? "");
set("META_CAPI_ENABLED", process.env.META_CAPI_ENABLED ?? "");
set("META_CAPI_DRY_RUN", process.env.META_CAPI_DRY_RUN ?? "");

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseAnon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
const supabaseOk = Boolean(
  supabaseUrl?.trim() && supabaseAnon?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
);

const resendOk = Boolean(
  process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim()
);

const airtableCreds = Boolean(
  process.env.AIRTABLE_API_KEY?.trim() && process.env.AIRTABLE_BASE_ID?.trim()
);

const zapEnabled = isTrue("ZAPIER_ENABLED");
const zapDry = isTrue("ZAPIER_DRY_RUN");

const bookingOk = Boolean(
  (process.env.NEXT_PUBLIC_BOOKING_EMBED_URL ?? process.env.NEXT_PUBLIC_BOOKING_URL)?.trim()
);

const cronOk = boolOk("CRON_SECRET");

const metaPixelOk = boolOk("NEXT_PUBLIC_META_PIXEL_ID");
const metaCapiOk = Boolean(
  metaPixelOk &&
    process.env.META_ACCESS_TOKEN?.trim() &&
    isTrue("META_CAPI_ENABLED") &&
    !isTrue("META_CAPI_DRY_RUN")
);

const sanityCore = Boolean(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() &&
    process.env.NEXT_PUBLIC_SANITY_DATASET?.trim()
);
const sanityPreviewOk = sanityCore && boolOk("SANITY_API_READ_TOKEN");

const rows = [
  {
    name: "Supabase (URL + anon + service role)",
    ok: supabaseOk,
    hint: supabaseOk
      ? null
      : "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY",
  },
  {
    name: "Resend email",
    ok: resendOk,
    hint: resendOk ? null : "Set RESEND_API_KEY and EMAIL_FROM",
  },
  {
    name: "Email mode",
    ok: !isTrue("EMAIL_DRY_RUN") && resendOk,
    hint: isTrue("EMAIL_DRY_RUN")
      ? "EMAIL_DRY_RUN=true — set false after Resend is verified"
      : !resendOk
        ? "Fix Resend first"
        : "Live email",
  },
  {
    name: "Airtable credentials",
    ok: airtableCreds,
    hint: airtableCreds ? null : "Set AIRTABLE_API_KEY, AIRTABLE_BASE_ID, table IDs",
  },
  {
    name: "Airtable sync",
    ok: isTrue("AIRTABLE_SYNC_ENABLED") && !isTrue("AIRTABLE_DRY_RUN"),
    hint: !isTrue("AIRTABLE_SYNC_ENABLED")
      ? "Set AIRTABLE_SYNC_ENABLED=true when ready"
      : isTrue("AIRTABLE_DRY_RUN")
        ? "AIRTABLE_DRY_RUN=true — set false for live push"
        : "Live sync",
  },
  {
    name: "Zapier",
    ok: zapEnabled && !zapDry,
    hint: !zapEnabled
      ? "ZAPIER_ENABLED=false"
      : zapDry
        ? "ZAPIER_DRY_RUN=true — set false for live POSTs"
        : "Live relays",
  },
  {
    name: "Booking URL",
    ok: bookingOk,
    hint: bookingOk ? null : "NEXT_PUBLIC_BOOKING_EMBED_URL or NEXT_PUBLIC_BOOKING_URL",
  },
  {
    name: "Cron secret (Vercel crons)",
    ok: cronOk,
    hint: cronOk ? null : "Set CRON_SECRET for /api/cron/* Bearer auth in production",
  },
  {
    name: "Meta Pixel",
    ok: metaPixelOk,
    hint: metaPixelOk ? null : "Set NEXT_PUBLIC_META_PIXEL_ID from Meta Events Manager",
  },
  {
    name: "Sanity CMS (project + dataset)",
    ok: sanityCore,
    hint: sanityCore
      ? null
      : "Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET in .env.local",
  },
  {
    name: "Sanity read token (drafts / previews)",
    ok: sanityPreviewOk,
    hint: sanityCore
      ? sanityPreviewOk
        ? null
        : "SANITY_API_READ_TOKEN — https://www.sanity.io/manage → Project → API → Tokens"
      : "Set Sanity project first",
  },
  {
    name: "Meta Conversions API",
    ok: metaCapiOk,
    hint: !metaPixelOk
      ? "Set Pixel ID first"
      : !process.env.META_ACCESS_TOKEN?.trim()
        ? "Set server-only META_ACCESS_TOKEN"
        : !isTrue("META_CAPI_ENABLED")
          ? "META_CAPI_ENABLED=false"
          : isTrue("META_CAPI_DRY_RUN")
            ? "META_CAPI_DRY_RUN=true — set false for live conversion POSTs"
            : "Live conversion POSTs",
  },
];

const status = (ok) => (ok ? "✓" : "✗");

console.log("Integration checklist (secrets masked if short preview):\n");
for (const r of rows) {
  console.log(`  ${status(r.ok)} ${r.name}`);
  if (r.hint) console.log(`      → ${r.hint}`);
}

console.log("\nSample values (masked, identifiers redacted):");
for (const key of [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "CRON_SECRET",
  "NEXT_PUBLIC_META_PIXEL_ID",
  "META_CAPI_ENABLED",
  "META_CAPI_DRY_RUN",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "SANITY_API_READ_TOKEN",
  "ZAPIER_ENABLED",
]) {
  console.log(`  ${key}=${mask(key, process.env[key])}`);
}

const missingCore = !supabaseOk || !resendOk;
if (missingCore) {
  console.log(
    "\nNext: Fill .env.local from .env.example, run Supabase migrations, then open /admin/settings/launch-readiness after login."
  );
  process.exitCode = 1;
}
