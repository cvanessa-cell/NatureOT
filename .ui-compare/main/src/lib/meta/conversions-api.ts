import { createHash } from "crypto";
import { getEnv } from "@/lib/env";
import { clientIpFromHeaders } from "@/lib/http/client-ip";

const META_GRAPH_VERSION = "v23.0";

export type MetaConversionEventName =
  | "Lead"
  | "Schedule"
  | "CompleteRegistration";

export type SendMetaConversionInput = {
  req: Request;
  eventName: MetaConversionEventName;
  email?: string | null;
  phone?: string | null;
  eventId?: string | null;
  sourceUrl?: string | null;
  fbclid?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  customData?: Record<string, unknown>;
};

type MetaUserData = {
  em?: string[];
  ph?: string[];
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string;
  fbp?: string;
};

type MetaEventPayload = {
  event_name: MetaConversionEventName;
  event_time: number;
  action_source: "website";
  event_id?: string;
  event_source_url?: string;
  user_data: MetaUserData;
  custom_data?: Record<string, unknown>;
};

function normalizeForHash(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized ? normalized : null;
}

export function sha256Hash(value: string | null | undefined): string | null {
  const normalized = normalizeForHash(value);
  if (!normalized) return null;
  return createHash("sha256").update(normalized).digest("hex");
}

function normalizePhone(value: string | null | undefined): string | null {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (!digits) return null;
  return digits.length === 10 ? `1${digits}` : digits;
}

export function fbcFromFbclid(
  fbclid: string | null | undefined,
  eventTimeSeconds: number
): string | undefined {
  const trimmed = fbclid?.trim();
  if (!trimmed) return undefined;
  return `fb.1.${eventTimeSeconds}.${trimmed}`;
}

function parseCookie(req: Request, name: string): string | undefined {
  const cookie = req.headers.get("cookie");
  if (!cookie) return undefined;

  for (const pair of cookie.split(";")) {
    const [rawKey, ...rawValue] = pair.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }
  return undefined;
}

function eventSourceUrl(req: Request, explicit: string | null | undefined): string {
  return explicit?.trim() || req.url;
}

export function buildMetaConversionPayload(input: SendMetaConversionInput): {
  payload: MetaEventPayload;
} {
  const eventTime = Math.floor(Date.now() / 1000);
  const emailHash = sha256Hash(input.email);
  const phoneHash = sha256Hash(normalizePhone(input.phone));
  const fbc =
    input.fbc?.trim() ||
    parseCookie(input.req, "_fbc") ||
    fbcFromFbclid(input.fbclid, eventTime);
  const fbp = input.fbp?.trim() || parseCookie(input.req, "_fbp");

  const userData: MetaUserData = {};
  if (emailHash) userData.em = [emailHash];
  if (phoneHash) userData.ph = [phoneHash];
  if (fbc) userData.fbc = fbc;
  if (fbp) userData.fbp = fbp;

  const ip = clientIpFromHeaders(input.req.headers);
  const userAgent = input.req.headers.get("user-agent");
  if (ip) userData.client_ip_address = ip;
  if (userAgent) userData.client_user_agent = userAgent;

  const payload: MetaEventPayload = {
    event_name: input.eventName,
    event_time: eventTime,
    action_source: "website",
    event_source_url: eventSourceUrl(input.req, input.sourceUrl),
    user_data: userData,
  };
  if (input.eventId?.trim()) payload.event_id = input.eventId.trim();
  if (input.customData && Object.keys(input.customData).length > 0) {
    payload.custom_data = input.customData;
  }

  return { payload };
}

export async function sendMetaConversion(input: SendMetaConversionInput): Promise<{
  skipped: boolean;
  dryRun: boolean;
  reason?: string;
}> {
  const env = getEnv();
  const pixelId = env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const accessToken = env.META_ACCESS_TOKEN?.trim();
  const enabled = env.META_CAPI_ENABLED === "true";
  const dryRun = env.META_CAPI_DRY_RUN !== "false";

  if (!enabled) return { skipped: true, dryRun, reason: "meta_capi_disabled" };
  if (!pixelId) return { skipped: true, dryRun, reason: "missing_pixel_id" };
  if (!accessToken) return { skipped: true, dryRun, reason: "missing_access_token" };

  const { payload } = buildMetaConversionPayload(input);
  const body: Record<string, unknown> = { data: [payload] };
  if (env.META_TEST_EVENT_CODE?.trim()) {
    body.test_event_code = env.META_TEST_EVENT_CODE.trim();
  }

  if (dryRun) {
    console.info("[meta-capi] dry run", {
      event_name: payload.event_name,
      event_id: payload.event_id,
    });
    return { skipped: true, dryRun: true, reason: "dry_run" };
  }

  const res = await fetch(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Meta CAPI request failed (${res.status}): ${text}`);
  }

  return { skipped: false, dryRun: false };
}

export async function trySendMetaConversion(input: SendMetaConversionInput) {
  try {
    return await sendMetaConversion(input);
  } catch (error) {
    console.error("[meta-capi] conversion send failed", error);
    return { skipped: true, dryRun: false, reason: "send_failed" };
  }
}
