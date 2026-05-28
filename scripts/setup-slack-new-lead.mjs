/**
 * Direct Slack alerts for new quiz leads (no Zapier subscription).
 *
 * Usage:
 *   node --env-file=.env.local scripts/setup-slack-new-lead.mjs
 *   node --env-file=.env.local scripts/setup-slack-new-lead.mjs --test
 */
const args = new Set(process.argv.slice(2));
const shouldTest = args.has("--test");

const SAMPLE = {
  lead_id: "00000000-0000-4000-8000-000000000099",
  parent_name: "Alex Parent",
  parent_email: "parent@example.com",
  parent_phone: "+15551234567",
  child_age_range: "4-6",
  city_or_zip: "Austin, TX",
  primary_result_category: "sensory_exploration",
  lead_source: "lead_form",
  consent_marketing: true,
};

function status(key) {
  const v = process.env[key]?.trim();
  return v ? "ok" : "missing";
}

function formatMessage(fields) {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const lines = [
    "*New quiz lead*",
    `• Name: ${fields.parent_name || "—"}`,
    `• Email: ${fields.parent_email}`,
    `• Phone: ${fields.parent_phone}`,
    `• Child age: ${fields.child_age_range}`,
    `• Location: ${fields.city_or_zip}`,
    `• Result: ${fields.primary_result_category}`,
    `• Source: ${fields.lead_source}`,
    `• Marketing consent: ${fields.consent_marketing ? "yes" : "no"}`,
    `• Lead ID: \`${fields.lead_id}\``,
    `<${base}/admin/leads|Open in admin>`,
  ];
  return lines.join("\n");
}

async function main() {
  const enabled = process.env.SLACK_ENABLED === "true";
  const dryRun = process.env.SLACK_DRY_RUN === "true";
  const webhookUrl = process.env.SLACK_WEBHOOK_URL?.trim();

  console.log("\nNature OT — new lead → Slack (direct, no Zapier)\n");
  console.log(`  SLACK_ENABLED .............. ${enabled ? "true" : "false"}`);
  console.log(`  SLACK_DRY_RUN .............. ${dryRun ? "true" : "false"}`);
  console.log(`  SLACK_WEBHOOK_URL .......... ${status("SLACK_WEBHOOK_URL")}\n`);

  console.log("Create a Slack Incoming Webhook (one-time):");
  console.log("  1. https://api.slack.com/apps → Create New App → From scratch");
  console.log("  2. Incoming Webhooks → On → Add New Webhook to Workspace");
  console.log("  3. Pick your leads channel → Allow");
  console.log("  4. Copy webhook URL into .env.local:");
  console.log("       SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...");
  console.log("       SLACK_ENABLED=true");
  console.log("       SLACK_DRY_RUN=false");
  console.log("  5. (Recommended) ZAPIER_ENABLED=false — avoids paid Catch Hook\n");

  console.log("Sample message preview:\n");
  console.log(formatMessage(SAMPLE));
  console.log("");

  if (shouldTest) {
    if (!webhookUrl) {
      console.error("Cannot --test: SLACK_WEBHOOK_URL is empty.");
      process.exit(1);
    }
    if (!enabled) {
      console.error("Cannot --test: set SLACK_ENABLED=true");
      process.exit(1);
    }
    if (dryRun) {
      console.error("Cannot --test: set SLACK_DRY_RUN=false");
      process.exit(1);
    }
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: formatMessage(SAMPLE) }),
    });
    const text = await res.text().catch(() => "");
    console.log(`Test POST → HTTP ${res.status}${text ? ` ${text}` : ""}`);
    if (!res.ok) process.exit(1);
    console.log("Check your Slack channel for the test message.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
