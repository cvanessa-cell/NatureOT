/**
 * New-lead Zapier bridge setup: env checklist, sample payload, optional webhook test.
 *
 * Usage:
 *   node --env-file=.env.local scripts/setup-zapier-new-lead.mjs
 *   node --env-file=.env.local scripts/setup-zapier-new-lead.mjs --open
 *   node --env-file=.env.local scripts/setup-zapier-new-lead.mjs --test
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { loadProjectContext } from "./lib/project-context.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const args = new Set(process.argv.slice(2));
const shouldOpen = args.has("--open");
const shouldTest = args.has("--test");

const SAMPLE_PAYLOAD = {
  event: "lead_created",
  lead_id: "00000000-0000-4000-8000-000000000001",
  parent_email: "parent@example.com",
  parent_name: "Alex Parent",
  parent_phone: "+15551234567",
  child_age_range: "4-6",
  city_or_zip: "Austin, TX",
  primary_result_category: "sensory_exploration",
  lead_source: "lead_form",
  consent_marketing: true,
};

const ZAPIER_MCP_CONFIG =
  "https://mcp.zapier.com/mcp/servers/90aaf19d-fd2e-4b4b-bf8f-bafcb52859b4/config";

function openUrl(url) {
  if (!url || process.platform === "linux" && !process.env.DISPLAY) return;
  if (process.platform === "win32") {
    execSync(`start "" "${url.replace(/"/g, '\\"')}"`, { stdio: "inherit", shell: true });
  } else if (process.platform === "darwin") {
    execSync(`open "${url}"`, { stdio: "inherit" });
  } else {
    execSync(`xdg-open "${url}"`, { stdio: "inherit" });
  }
}

function status(key) {
  const v = process.env[key]?.trim();
  return v ? "ok" : "missing";
}

async function main() {
  const ctx = loadProjectContext();
  const webhookUrl = process.env.ZAPIER_NEW_LEAD_WEBHOOK_URL?.trim();
  const enabled = process.env.ZAPIER_ENABLED === "true";
  const dryRun = process.env.ZAPIER_DRY_RUN === "true";
  const airtableLive =
    process.env.AIRTABLE_SYNC_ENABLED === "true" &&
    process.env.AIRTABLE_DRY_RUN !== "true" &&
    Boolean(process.env.AIRTABLE_API_KEY?.trim());

  console.log("\nNature OT — new lead → Airtable + Slack (Zapier)\n");
  console.log("App-side (already wired in /api/leads):");
  console.log(`  • Airtable sync job enqueue ........ ${airtableLive ? "ready (live)" : "check AIRTABLE_* flags"}`);
  console.log(`  • Zapier outbound (new_lead) ......... ZAPIER_ENABLED=${enabled ? "true" : "false"} ZAPIER_DRY_RUN=${dryRun ? "true" : "false"}`);
  console.log(`  • Catch Hook URL ..................... ${status("ZAPIER_NEW_LEAD_WEBHOOK_URL")}\n`);

  console.log("Create ONE Zap in Zapier (recommended steps):");
  console.log("  1. Trigger: Webhooks by Zapier → Catch Hook");
  console.log("  2. Test trigger → copy the webhook URL into .env.local:");
  console.log("       ZAPIER_NEW_LEAD_WEBHOOK_URL=<paste Catch Hook URL>");
  console.log("  3. Action: Slack → Send Channel Message");
  console.log("     Message example:");
  console.log(
    '       New quiz lead: {{parent_name}} ({{parent_email}}) — {{city_or_zip}} — {{primary_result_category}}'
  );
  console.log("  4. (Optional) Skip Airtable in Zap — the app pushes to Airtable directly.\n");

  console.log("Sample JSON POST body (minimum-necessary fields only):");
  console.log(JSON.stringify(SAMPLE_PAYLOAD, null, 2));

  console.log("\nAfter pasting the Catch Hook URL, flip in .env.local:");
  console.log("  ZAPIER_ENABLED=true");
  console.log("  ZAPIER_DRY_RUN=false\n");

  console.log("Links:");
  console.log(`  Zapier MCP tools:  ${ZAPIER_MCP_CONFIG}`);
  console.log(`  Zapier dashboard:  https://zapier.com/app/zaps`);
  console.log(`  Admin audit UI:    ${(ctx.appUrl ?? "http://localhost:3000").replace(/\/$/, "")}/admin/zapier\n`);

  if (shouldOpen) {
    openUrl("https://zapier.com/app/editor");
    openUrl(ZAPIER_MCP_CONFIG);
  }

  if (shouldTest) {
    if (!webhookUrl) {
      console.error("Cannot --test: ZAPIER_NEW_LEAD_WEBHOOK_URL is empty.");
      process.exit(1);
    }
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(SAMPLE_PAYLOAD),
    });
    const text = await res.text().catch(() => "");
    console.log(`Test POST → HTTP ${res.status}${text ? ` ${text.slice(0, 200)}` : ""}`);
    if (!res.ok) process.exit(1);
    console.log("Catch Hook accepted the sample payload.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
