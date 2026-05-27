import { NextResponse } from "next/server";
import { appBaseUrl, getEnv } from "@/lib/env";
import { writeAuditLog } from "@/lib/audit";
import { clientIpFromHeaders } from "@/lib/http/client-ip";
import { createAdminClient } from "@/lib/supabase/admin";

async function signedUrlFromStorage(): Promise<string | null> {
  const env = getEnv();
  const bucket = env.PARENT_GUIDE_STORAGE_BUCKET?.trim();
  const objectPath = env.PARENT_GUIDE_STORAGE_PATH?.trim();
  if (!bucket || !objectPath) return null;

  try {
    const supabase = createAdminClient();
    const expires =
      Math.min(
        Math.max(Number(env.PARENT_GUIDE_SIGNED_URL_EXPIRES_SECONDS) || 3600, 60),
        60 * 60 * 24 * 7
      );
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(objectPath, expires);
    if (error || !data?.signedUrl) {
      void writeAuditLog({
        action: "parent_guide_signed_url_failed",
        resourceType: "marketing_asset",
        details: { stage: "storage_sign", code: error?.message ?? "unknown" },
      });
      return null;
    }
    return data.signedUrl;
  } catch (e) {
    void writeAuditLog({
      action: "parent_guide_signed_url_failed",
      resourceType: "marketing_asset",
      details: {
        stage: "exception",
        message: e instanceof Error ? e.message.slice(0, 200) : "error",
      },
    });
    return null;
  }
}

/** Public download handoff — redirects to HTML/PDF asset; optional intent logging via query params. */
export async function GET(req: Request) {
  const env = getEnv();
  const base = appBaseUrl().replace(/\/$/, "");
  const url = new URL(req.url);
  const emailRaw = url.searchParams.get("email")?.trim();
  const token = url.searchParams.get("token")?.trim();

  if (emailRaw || token) {
    const normalized = emailRaw?.toLowerCase();
    let emailDomainHint: string | undefined;
    if (normalized?.includes("@")) {
      emailDomainHint = normalized.split("@")[1]?.slice(0, 160);
    }
    void writeAuditLog({
      action: "parent_guide_download_intent",
      resourceType: "marketing_asset",
      details: {
        delivery_mode: env.PARENT_GUIDE_DELIVERY_MODE ?? "public_asset",
        ...(emailDomainHint ? { email_domain_hint: emailDomainHint } : {}),
        ...(token ? { opaque_token_present: true } : {}),
      },
      ip: clientIpFromHeaders(req.headers),
    });
  }

  const mode = (env.PARENT_GUIDE_DELIVERY_MODE ?? "public_asset").trim().toLowerCase();
  const fallbackPath =
    env.PARENT_GUIDE_PUBLIC_ASSET_PATH?.trim() ||
    "/guides/outdoor-sensory-activities-texas-kids.html";

  const publicAssetUrl = `${base}${fallbackPath.startsWith("/") ? fallbackPath : `/${fallbackPath}`}`;

  let destination: string = publicAssetUrl;

  if (mode === "signed_url") {
    const signed = await signedUrlFromStorage();
    if (signed) destination = signed;
    else destination = publicAssetUrl;
  } else if (
    mode === "signed_url_future" &&
    env.PARENT_GUIDE_ASSET_URL?.startsWith("http")
  ) {
    destination = env.PARENT_GUIDE_ASSET_URL;
  } else if (env.PARENT_GUIDE_ASSET_URL?.startsWith("http")) {
    destination = env.PARENT_GUIDE_ASSET_URL;
  }

  return NextResponse.redirect(destination, 302);
}
