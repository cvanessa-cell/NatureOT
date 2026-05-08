import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

type AttributionData = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  landing_page?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
  ip_hash?: string | null;
  session_id?: string | null;
  campaign_id?: string | null;
};

type CreateAttributionInput = AttributionData & {
  lead_id?: string | null;
  email?: string | null;
  event_type: string;
  source_route?: string | null;
  metadata?: Record<string, unknown>;
};

function getHeader(req: Request, key: string): string | null {
  return req.headers.get(key);
}

function getClientIp(req: Request): string | null {
  return (
    getHeader(req, "x-forwarded-for")?.split(",")[0]?.trim() ??
    getHeader(req, "x-real-ip") ??
    null
  );
}

export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex");
}

export function parseAttributionFromRequest(req: Request): AttributionData {
  const url = new URL(req.url);
  return {
    utm_source: url.searchParams.get("utm_source"),
    utm_medium: url.searchParams.get("utm_medium"),
    utm_campaign: url.searchParams.get("utm_campaign"),
    utm_content: url.searchParams.get("utm_content"),
    utm_term: url.searchParams.get("utm_term"),
    gclid: url.searchParams.get("gclid"),
    fbclid: url.searchParams.get("fbclid"),
    landing_page: url.searchParams.get("landing_page") ?? url.pathname,
    referrer: getHeader(req, "referer"),
    user_agent: getHeader(req, "user-agent"),
    ip_hash: hashIp(getClientIp(req)),
    session_id: url.searchParams.get("session_id"),
  };
}

export async function createAttributionEvent(input: CreateAttributionInput) {
  const supabase = createAdminClient();
  await supabase.from("lead_attribution_events").insert({
    lead_id: input.lead_id ?? null,
    email: input.email ?? null,
    session_id: input.session_id ?? null,
    campaign_id: input.campaign_id ?? null,
    event_type: input.event_type,
    source_route: input.source_route ?? null,
    landing_page: input.landing_page ?? null,
    referrer: input.referrer ?? null,
    utm_source: input.utm_source ?? null,
    utm_medium: input.utm_medium ?? null,
    utm_campaign: input.utm_campaign ?? null,
    utm_content: input.utm_content ?? null,
    utm_term: input.utm_term ?? null,
    gclid: input.gclid ?? null,
    fbclid: input.fbclid ?? null,
    user_agent: input.user_agent ?? null,
    ip_hash: input.ip_hash ?? null,
    metadata: input.metadata ?? {},
  });
}

export async function attachAttributionToLead(input: {
  leadId?: string | null;
  email?: string | null;
  req: Request;
  eventType: string;
  sourceRoute: string;
  metadata?: Record<string, unknown>;
}) {
  const parsed = parseAttributionFromRequest(input.req);
  return createAttributionEvent({
    ...parsed,
    lead_id: input.leadId ?? null,
    email: input.email ?? null,
    event_type: input.eventType,
    source_route: input.sourceRoute,
    metadata: input.metadata ?? {},
  });
}

export async function resolveFirstTouch(email: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("lead_attribution_events")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function resolveLastTouch(email: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("lead_attribution_events")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}
