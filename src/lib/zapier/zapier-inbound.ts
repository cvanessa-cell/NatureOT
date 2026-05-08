import { getEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { summarizePayloadForLog, stripUnsafeZapierPayload } from "./zapier-safety-filter";

export function extractInboundZapierSecret(req: Request): string | null {
  const explicit = req.headers.get("x-zapier-secret");
  if (explicit?.trim()) return explicit.trim();

  const auth = req.headers.get("authorization") ?? "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (m?.[1]?.trim()) return m[1].trim();

  const url = new URL(req.url);
  const q = url.searchParams.get("secret");
  return q?.trim() || null;
}

export function assertZapierWebhookSecret(req: Request):
  | { ok: true; secret_ok: boolean }
  | { ok: false; status: number; message: string } {
  const expected = getEnv().ZAPIER_WEBHOOK_SECRET?.trim();
  if (!expected) {
    return {
      ok: false,
      status: 503,
      message: "ZAPIER_WEBHOOK_SECRET is not configured",
    };
  }

  const got = extractInboundZapierSecret(req);
  if (!got || got !== expected) {
    return {
      ok: false,
      status: 401,
      message: "Invalid or missing webhook secret",
    };
  }

  return { ok: true, secret_ok: true };
}

/**
 * Persist inbound webhook from Zapier (or Zapier-connected apps) — payload is stripped + summarized.
 */
export async function logZapierInbound(opts: {
  routeSegment: string;
  rawBody: unknown;
}): Promise<{ id?: string }> {
  const supabase = createAdminClient();

  let bodyObj: Record<string, unknown>;
  if (rawBodyRecord(opts.rawBody)) {
    bodyObj = opts.rawBody;
  } else {
    bodyObj = { _raw_type: typeof opts.rawBody };
  }

  const { data, strippedKeys } = stripUnsafeZapierPayload(bodyObj);
  const payload_summary = {
    ...summarizePayloadForLog(data),
    strippedKeys,
    routeSegment: opts.routeSegment,
    direction: "inbound",
  };

  const insert = await supabase
    .from("zapier_events")
    .insert({
      event_type: `inbound:zapier/${opts.routeSegment}`,
      source: "zapier",
      destination: "app",
      payload_summary,
      contains_parent_child_data: inferParentChild(payload_summary),
      phi_risk_level: "low",
      approval_required: false,
      approval_status: "not_required",
      result: "received",
      sent_at: new Date().toISOString(),
      related_zap_key: null,
    })
    .select("id")
    .maybeSingle();

  return { id: insert.data?.id as string | undefined };
}

function rawBodyRecord(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

function inferParentChild(payload_summary: Record<string, unknown>): boolean {
  try {
    const keys = payload_summary.keys;
    if (Array.isArray(keys)) {
      const joined = keys.join(" ").toLowerCase();
      return (
        joined.includes("parent") ||
        joined.includes("child") ||
        joined.includes("email")
      );
    }
    return false;
  } catch {
    return false;
  }
}
