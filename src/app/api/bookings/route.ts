import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";
import { writeAuditLog } from "@/lib/audit";
import { mapBookingCreatedPayload } from "@/lib/zapier/zapier-payload-mapper";
import { queueZapierOutbound } from "@/lib/zapier/outbound-webhooks";
import { recordLifecycleEvent } from "@/lib/marketing/lifecycle";
import { attachAttributionToLead } from "@/lib/marketing/attribution";

const schema = z.object({
  leadId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  provider: z.enum(["calcom", "calendly", "manual"]).default("manual"),
  externalId: z.string().optional(),
  attribution_first_touch: z.record(z.string(), z.string()).optional(),
  attribution_last_touch: z.record(z.string(), z.string()).optional(),
});

export async function POST(req: Request) {
  if (!getEnv().SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;
  if (!body.leadId && !body.email) {
    return NextResponse.json(
      { error: "Provide leadId or email" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  let leadId = body.leadId ?? null;
  if (!leadId && body.email) {
    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("parent_email", body.email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    leadId = lead?.id ?? null;
  }
  if (!leadId) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const { data: leadSnap } = await supabase
    .from("leads")
    .select("parent_email, unsubscribed_at")
    .eq("id", leadId as string)
    .maybeSingle();

  await supabase.from("bookings").insert({
    lead_id: leadId,
    provider: body.provider,
    external_id: body.externalId ?? null,
    status: "scheduled",
  });

  await supabase
    .from("leads")
    .update({
      nurture_stopped: true,
      nurture_stopped_reason: "booked",
      reminder_48h_sent_at: new Date().toISOString(),
    })
    .eq("id", leadId);
  await recordLifecycleEvent(leadId as string, "call_booked", { source: "/api/bookings" });
  await attachAttributionToLead({
    leadId,
    email: (leadSnap?.parent_email as string | null) ?? body.email ?? null,
    req,
    eventType: "call_booked",
    sourceRoute: "/api/bookings",
    metadata: {
      attribution_first_touch: body.attribution_first_touch ?? {},
      attribution_last_touch: body.attribution_last_touch ?? {},
    },
  });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  await writeAuditLog({
    action: "booking_recorded",
    resourceType: "bookings",
    resourceId: leadId,
    ip,
  });

  const bookingMapped = mapBookingCreatedPayload({
    lead_id: leadId as string,
    provider: body.provider,
    external_id: body.externalId ?? null,
    status: "scheduled",
    lead_email: (leadSnap?.parent_email as string | null) ?? undefined,
  });

  queueZapierOutbound({
    zapKey: "booking_created",
    payload: bookingMapped.data,
    logExtras: { stripped_keys: bookingMapped.strippedKeys },
    containsParentChildData: true,
    phiRiskLevel: bookingMapped.phiRiskSuggestion,
    approvalRequired: false,
    approvalStatus: "not_required",
    unsubscribed: Boolean(leadSnap?.unsubscribed_at),
  });

  return NextResponse.json({ ok: true, leadId });
}
