import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapUnsubscribePayload } from "@/lib/zapier/zapier-payload-mapper";
import { queueZapierOutbound } from "@/lib/zapier/outbound-webhooks";
import { recordLifecycleEvent } from "@/lib/marketing/lifecycle";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const preview = url.searchParams.get("preview");
  if (preview) {
    return new NextResponse(
      "Unsubscribe links are included in every marketing email. Submitting your token will stop nurture emails.",
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  const supabase = createAdminClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("id, parent_email")
    .eq("unsubscribe_token", token)
    .maybeSingle();
  if (!lead) {
    return new NextResponse(
      "We could not find this subscription. If you still receive mail, contact us from our website.",
      { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
  await supabase
    .from("leads")
    .update({
      unsubscribed_at: new Date().toISOString(),
      consent_marketing: false,
      nurture_stopped: true,
      nurture_stopped_reason: "unsubscribe",
    })
    .eq("id", lead.id);
  await recordLifecycleEvent(lead.id as string, "unsubscribed", { source: "/api/unsubscribe" });

  const unsub = mapUnsubscribePayload({
    lead_id: lead.id as string,
    email: lead.parent_email as string | null,
  });

  queueZapierOutbound({
    zapKey: "unsubscribe_event",
    payload: unsub.data,
    logExtras: { stripped_keys: unsub.strippedKeys },
    containsParentChildData: true,
    phiRiskLevel: unsub.phiRiskSuggestion,
    approvalRequired: false,
    approvalStatus: "not_required",
    unsubscribed: false,
  });

  return new NextResponse(
    "You have been unsubscribed from marketing emails. We may still send transactional messages required by law or related to care you already receive.",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}
