import { appBaseUrl, getEnv } from "@/lib/env";

export type SlackSendResult =
  | { ok: true }
  | { ok: false; error: string; code: "disabled" | "not_configured" | "dry_run" | "send_failed" };

/** POST a plain-text message to a Slack Incoming Webhook (server-only). */
export async function sendSlackWebhookMessage(text: string): Promise<SlackSendResult> {
  const env = getEnv();
  if (env.SLACK_ENABLED !== "true") {
    return { ok: false, error: "Slack disabled", code: "disabled" };
  }
  if (env.SLACK_DRY_RUN === "true") {
    console.info("[slack] dry_run — message not sent:", text.slice(0, 200));
    return { ok: false, error: "dry_run", code: "dry_run" };
  }
  const webhookUrl = env.SLACK_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    console.warn("[slack] SLACK_WEBHOOK_URL missing — message not sent");
    return { ok: false, error: "webhook_not_configured", code: "not_configured" };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[slack] HTTP", res.status, body.slice(0, 300));
      return {
        ok: false,
        error: `HTTP ${res.status}`,
        code: "send_failed",
      };
    }
    return { ok: true };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error("[slack]", err);
    return { ok: false, error: err, code: "send_failed" };
  }
}

export type NewLeadSlackFields = {
  lead_id: string;
  parent_name?: string | null;
  parent_email: string;
  parent_phone?: string | null;
  child_age_range?: string | null;
  city_or_zip?: string | null;
  primary_result_category?: string | null;
  lead_source?: string | null;
  consent_marketing?: boolean | null;
};

export function formatNewLeadSlackMessage(fields: NewLeadSlackFields): string {
  const base = appBaseUrl().replace(/\/$/, "");
  const lines = [
    "*New quiz lead*",
    `• Name: ${fields.parent_name?.trim() || "—"}`,
    `• Email: ${fields.parent_email}`,
  ];
  if (fields.parent_phone?.trim()) {
    lines.push(`• Phone: ${fields.parent_phone.trim()}`);
  }
  if (fields.child_age_range?.trim()) {
    lines.push(`• Child age: ${fields.child_age_range.trim()}`);
  }
  if (fields.city_or_zip?.trim()) {
    lines.push(`• Location: ${fields.city_or_zip.trim()}`);
  }
  if (fields.primary_result_category?.trim()) {
    lines.push(`• Result: ${fields.primary_result_category.trim()}`);
  }
  if (fields.lead_source?.trim()) {
    lines.push(`• Source: ${fields.lead_source.trim()}`);
  }
  lines.push(
    `• Marketing consent: ${fields.consent_marketing ? "yes" : "no"}`,
    `• Lead ID: \`${fields.lead_id}\``,
    `<${base}/admin/leads|Open in admin>`
  );
  return lines.join("\n");
}

/** Fire-and-forget — never blocks lead capture. */
export function queueSlackNewLeadAlert(fields: NewLeadSlackFields): void {
  void sendSlackWebhookMessage(formatNewLeadSlackMessage(fields)).catch(() => {});
}
