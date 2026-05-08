import { createAdminClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";
import { summarizePayloadForLog } from "./zapier-safety-filter";
import type { ZapierZapKey } from "./zapier-payload-mapper";

export type ZapierApprovalStatus =
  | "not_required"
  | "pending"
  | "approved"
  | "rejected";

export type SendZapierOutboundInput = {
  zapKey: ZapierZapKey;
  payload: Record<string, unknown>;
  /** When set, used as persisted `zapier_events.event_type` instead of `outbound:${zapKey}`. */
  auditEventType?: string;
  /** Merged only into persisted `payload_summary`, not forwarded to Zapier. */
  logExtras?: Record<string, unknown>;
  containsParentChildData: boolean;
  phiRiskLevel: "none" | "low" | "medium" | "high";
  /** When true and approvalStatus is not `approved`, webhook is skipped. */
  approvalRequired: boolean;
  approvalStatus?: ZapierApprovalStatus;
  /** If true, skips marketing-style bridges unless `unsubscribe_event` suppression path. */
  unsubscribed?: boolean;
  /** Resolved Catch Hook URL; if missing, caller may skip outbound HTTP. */
  webhookUrl?: string;
};

export type SendZapierOutboundResult = {
  eventRowId?: string;
  result:
    | "dry_run"
    | "sent"
    | "skipped_disabled"
    | "skipped_unsubscribed"
    | "skipped_no_url"
    | "blocked_pending_approval"
    | "failed";
  detail?: string;
};

function webhookUrlFromEnv(zapKey: ZapierZapKey): string | undefined {
  const env = getEnv();
  switch (zapKey) {
    case "new_lead":
      return env.ZAPIER_NEW_LEAD_WEBHOOK_URL;
    case "waitlist_entry":
      return env.ZAPIER_WAITLIST_WEBHOOK_URL;
    case "workshop_registration":
      return env.ZAPIER_WORKSHOP_WEBHOOK_URL;
    case "booking_created":
      return env.ZAPIER_BOOKING_WEBHOOK_URL;
    case "feedback_submitted":
    case "review_request":
      return env.ZAPIER_FEEDBACK_WEBHOOK_URL;
    case "automation_error":
      return env.ZAPIER_ERROR_WEBHOOK_URL;
    case "unsubscribe_event":
      return env.ZAPIER_UNSUBSCRIBE_WEBHOOK_URL;
    case "referral_followup":
    case "referral_inquiry":
      return env.ZAPIER_REFERRAL_WEBHOOK_URL;
    case "content_scheduling":
      return env.ZAPIER_CONTENT_WEBHOOK_URL;
    case "local_seo_build":
      return env.ZAPIER_SEO_WEBHOOK_URL;
    case "parent_guide_lead":
      return env.ZAPIER_NEW_LEAD_WEBHOOK_URL ?? env.ZAPIER_WAITLIST_WEBHOOK_URL;
    default:
      return undefined;
  }
}

export function resolveZapierWebhookUrl(zapKey: ZapierZapKey): string | undefined {
  const fromInput = webhookUrlFromEnv(zapKey);
  if (fromInput) return fromInput;
  return undefined;
}

function envEnabled(): boolean {
  return getEnv().ZAPIER_ENABLED === "true";
}

function envDryRun(): boolean {
  return getEnv().ZAPIER_DRY_RUN === "true";
}

async function persistEvent(input: {
  eventType: string;
  payload_summary: Record<string, unknown>;
  containsParentChildData: boolean;
  phiRiskLevel: SendZapierOutboundInput["phiRiskLevel"];
  approvalRequired: boolean;
  approvalStatus: ZapierApprovalStatus;
  result: SendZapierOutboundResult["result"] | string;
  error_message?: string | null;
  related_zap_key: string | null;
  sent_at: string | null;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("zapier_events")
    .insert({
      event_type: input.eventType,
      source: "app",
      destination: "zapier",
      payload_summary: input.payload_summary,
      contains_parent_child_data: input.containsParentChildData,
      phi_risk_level: input.phiRiskLevel,
      approval_required: input.approvalRequired,
      approval_status: input.approvalStatus,
      result: coerceResult(input.result),
      error_message: input.error_message ?? null,
      related_zap_key: input.related_zap_key,
      sent_at: input.sent_at,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[zapier_events]", error.message);
    return undefined;
  }
  return data?.id as string | undefined;
}

function coerceResult(
  r: string
):
  | "pending"
  | "received"
  | "dry_run"
  | "sent"
  | "skipped_disabled"
  | "skipped_unsubscribed"
  | "skipped_no_url"
  | "blocked_pending_approval"
  | "blocked_missing_authorization"
  | "blocked_not_approved_content"
  | "blocked_testimonial"
  | "failed" {
  const allowed = new Set([
    "pending",
    "received",
    "dry_run",
    "sent",
    "skipped_disabled",
    "skipped_unsubscribed",
    "skipped_no_url",
    "blocked_pending_approval",
    "blocked_missing_authorization",
    "blocked_not_approved_content",
    "blocked_testimonial",
    "failed",
  ]);
  if (allowed.has(r)) return r as never;
  return "failed";
}

async function bumpAutomationStats(
  zapKey: string,
  ok: boolean,
  errMsg?: string | null
) {
  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();
  await supabase
    .from("zapier_automations")
    .update({
      last_run_at: nowIso,
      error_log: ok ? null : (errMsg ?? "unknown failure"),
      status: ok ? "active" : "needs_review",
    })
    .eq("zap_key", zapKey);
}

/** Core bridge: persists audit row, optionally POSTs to Zapier Catch Hook. */
export async function sendZapierOutbound(
  input: SendZapierOutboundInput
): Promise<SendZapierOutboundResult> {
  const webhookUrl =
    input.webhookUrl ?? resolveZapierWebhookUrl(input.zapKey) ?? undefined;
  const enabled = envEnabled();
  const dryRun = envDryRun();

  /** Live Zapier POST only when approvals satisfied; dry-run previews may still log. */
  const liveBlockedByApproval =
    input.approvalRequired && input.approvalStatus !== "approved";

  const resolvedApprovalDb = resolveApprovalDbStatus(input);

  const eventType = input.auditEventType ?? `outbound:${input.zapKey}`;
  const payload_summary = summarizePayloadForLog(input.payload, 1800, {
    ...(input.logExtras ?? {}),
    ...(liveBlockedByApproval ? { preview_only_pending_approval: true } : {}),
  });

  if (!enabled) {
    const id = await persistEvent({
      eventType,
      payload_summary,
      containsParentChildData: input.containsParentChildData,
      phiRiskLevel: input.phiRiskLevel,
      approvalRequired: input.approvalRequired,
      approvalStatus: resolvedApprovalDb,
      result: "skipped_disabled",
      related_zap_key: input.zapKey,
      sent_at: null,
    }).catch(() => undefined);
    return { eventRowId: id, result: "skipped_disabled" };
  }

  if (input.unsubscribed && input.zapKey !== "unsubscribe_event") {
    const id = await persistEvent({
      eventType,
      payload_summary,
      containsParentChildData: input.containsParentChildData,
      phiRiskLevel: input.phiRiskLevel,
      approvalRequired: input.approvalRequired,
      approvalStatus: resolvedApprovalDb,
      result: "skipped_unsubscribed",
      related_zap_key: input.zapKey,
      sent_at: null,
    }).catch(() => undefined);
    return { eventRowId: id, result: "skipped_unsubscribed" };
  }

  if (dryRun) {
    const id = await persistEvent({
      eventType,
      payload_summary,
      containsParentChildData: input.containsParentChildData,
      phiRiskLevel: input.phiRiskLevel,
      approvalRequired: input.approvalRequired,
      approvalStatus: resolvedApprovalDb,
      result: "dry_run",
      related_zap_key: input.zapKey,
      sent_at: null,
    }).catch(() => undefined);
    return { eventRowId: id, result: "dry_run" };
  }

  if (liveBlockedByApproval) {
    const id = await persistEvent({
      eventType,
      payload_summary,
      containsParentChildData: input.containsParentChildData,
      phiRiskLevel: input.phiRiskLevel,
      approvalRequired: true,
      approvalStatus: resolvedApprovalDb,
      result: "blocked_pending_approval",
      related_zap_key: input.zapKey,
      sent_at: null,
    }).catch(() => undefined);
    return { eventRowId: id, result: "blocked_pending_approval" };
  }

  if (!webhookUrl) {
    const id = await persistEvent({
      eventType,
      payload_summary,
      containsParentChildData: input.containsParentChildData,
      phiRiskLevel: input.phiRiskLevel,
      approvalRequired: input.approvalRequired,
      approvalStatus: resolvedApprovalDb,
      result: "skipped_no_url",
      related_zap_key: input.zapKey,
      sent_at: null,
    }).catch(() => undefined);
    return { eventRowId: id, result: "skipped_no_url" };
  }

  let httpErr: string | null = null;
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input.payload),
    });
    if (!res.ok) {
      httpErr = `HTTP ${res.status} ${await res.text().catch(() => "")}`;
    }
  } catch (e) {
    httpErr = e instanceof Error ? e.message : String(e);
  }

  const sentIso = new Date().toISOString();
  const id = await persistEvent({
    eventType,
    payload_summary,
    containsParentChildData: input.containsParentChildData,
    phiRiskLevel: input.phiRiskLevel,
    approvalRequired: input.approvalRequired,
    approvalStatus: resolvedApprovalDb,
    result: httpErr ? "failed" : "sent",
    error_message: httpErr,
    related_zap_key: input.zapKey,
    sent_at: sentIso,
  }).catch(() => undefined);

  await bumpAutomationStats(input.zapKey, !httpErr, httpErr).catch(() => {});

  if (httpErr) {
    return { eventRowId: id, result: "failed", detail: httpErr };
  }

  return { eventRowId: id, result: "sent" };
}

function resolveApprovalDbStatus(
  input: SendZapierOutboundInput
): ZapierApprovalStatus {
  if (!input.approvalRequired) return "not_required";
  if (input.approvalStatus === "approved") return "approved";
  if (input.approvalStatus === "rejected") return "rejected";
  return "pending";
}

/** Fire-and-forget wrapper for route handlers — never blocks user flows. */
export function queueZapierOutbound(input: SendZapierOutboundInput): void {
  void sendZapierOutbound(input).catch(() => {});
}
