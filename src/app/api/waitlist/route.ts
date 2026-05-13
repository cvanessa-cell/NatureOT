import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";
import { sendTransactionalEmail } from "@/lib/mail";
import { waitlistConfirmationEmail } from "@/lib/emails/waitlist-confirmation";
import { writeAuditLog } from "@/lib/audit";
import { mapWaitlistCreatedPayload } from "@/lib/zapier/zapier-payload-mapper";
import { queueZapierOutbound } from "@/lib/zapier/outbound-webhooks";
import { attachAttributionToLead } from "@/lib/marketing/attribution";
import { recordLifecycleEvent } from "@/lib/marketing/lifecycle";
import { enrollLeadInSequence } from "@/lib/marketing/sequences";
import { upsertMarketingLead } from "@/lib/leads/marketing-lead-upsert";
import { parseParentName } from "@/lib/leads/lead-normalizer";
import { trySendMetaConversion } from "@/lib/meta/conversions-api";

const schema = z.object({
  parentName: z.string().min(1).max(200),
  parentEmail: z.string().email(),
  parentPhone: z.string().max(30).optional(),
  childAgeRange: z.string().min(1).max(80),
  cityOrZip: z.string().min(1).max(120),
  preferredSchedule: z.string().max(500).optional(),
  interestAreas: z.array(z.string()).max(12).optional(),
  generalNotes: z.string().max(1500).optional(),
  consentMarketing: z.boolean(),
  consentWaitlist: z.boolean(),
  consentPrivacy: z.boolean(),
  meta_event_id: z.string().optional(),
  attribution_first_touch: z.record(z.string(), z.string()).optional(),
  attribution_last_touch: z.record(z.string(), z.string()).optional(),
});

function clientIp(h: Headers): string | null {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    null
  );
}

export async function POST(req: Request) {
  if (!getEnv().SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const b = parsed.data;
  if (!b.consentPrivacy || !b.consentWaitlist) {
    return NextResponse.json(
      { error: "Waitlist and privacy consent required" },
      { status: 400 }
    );
  }

  const ip = clientIp(req.headers);
  const now = new Date().toISOString();
  const supabase = createAdminClient();
  const parsedName = parseParentName(b.parentName);

  let leadId: string | null = null;
  try {
    const up = await upsertMarketingLead(supabase, {
      parent_name: parsedName.parent_name,
      parent_email: b.parentEmail,
      parent_phone: b.parentPhone ?? null,
      city_or_zip: b.cityOrZip,
      child_age_range: b.childAgeRange,
      main_concern: "Waitlist submission",
      lead_source: "waitlist",
      form_type: "waitlist",
      consent_marketing: b.consentMarketing,
      consent_privacy: b.consentPrivacy,
      parent_first_name: parsedName.parent_first_name,
      parent_last_name: parsedName.parent_last_name,
      consent_ip: ip,
    });
    leadId = up.leadId;
  } catch {
    leadId = null;
  }

  const { data: row, error } = await supabase
    .from("waitlist_entries")
    .insert({
      parent_name: b.parentName,
      parent_email: b.parentEmail,
      parent_phone: b.parentPhone ?? null,
      child_age_range: b.childAgeRange,
      city_or_zip: b.cityOrZip,
      preferred_schedule: b.preferredSchedule ?? null,
      interest_areas: b.interestAreas ?? [],
      general_notes: b.generalNotes ?? null,
      consent_marketing: b.consentMarketing,
      consent_waitlist: b.consentWaitlist,
      consent_language_version: "waitlist_v1",
      consent_source_page: "/waitlist",
      consent_ip: ip,
      consent_at: now,
      status: "active",
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error(error);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }

  await supabase.from("consent_logs").insert({
    waitlist_entry_id: row.id,
    consent_type: "waitlist_and_privacy",
    language_snippet: "waitlist_v1",
    source_page: "/waitlist",
    email: b.parentEmail,
    ip,
  });

  if (b.consentMarketing) {
    const em = waitlistConfirmationEmail({
      parentName: b.parentName,
      unsubscribeHint:
        "Use unsubscribe links in future emails when we enable marketing sends.",
    });
    await sendTransactionalEmail({
      to: b.parentEmail,
      subject: em.subject,
      html: em.html,
      tags: [{ name: "waitlist_id", value: row.id as string }],
    });
  }

  await writeAuditLog({
    action: "waitlist_created",
    resourceType: "waitlist_entries",
    resourceId: row.id as string,
    ip,
  });

  const mapped = mapWaitlistCreatedPayload({
    id: row.id as string,
    parent_name: b.parentName,
    parent_email: b.parentEmail,
    parent_phone: b.parentPhone,
    child_age_range: b.childAgeRange,
    city_or_zip: b.cityOrZip,
    preferred_schedule: b.preferredSchedule,
    interest_areas: b.interestAreas ?? [],
    consent_marketing: b.consentMarketing,
    consent_waitlist: b.consentWaitlist,
  });

  queueZapierOutbound({
    zapKey: "waitlist_entry",
    payload: mapped.data,
    logExtras: { stripped_keys: mapped.strippedKeys },
    containsParentChildData: true,
    phiRiskLevel: mapped.phiRiskSuggestion,
    approvalRequired: false,
    approvalStatus: "not_required",
  });

  await attachAttributionToLead({
    leadId,
    email: b.parentEmail.trim().toLowerCase(),
    req,
    eventType: "waitlist_joined",
    sourceRoute: "/api/waitlist",
    metadata: {
      waitlist_entry_id: row.id,
      attribution_first_touch: b.attribution_first_touch ?? {},
      attribution_last_touch: b.attribution_last_touch ?? {},
      meta_event_id: b.meta_event_id ?? null,
    },
  });
  await trySendMetaConversion({
    req,
    eventName: "Lead",
    email: b.parentEmail,
    phone: b.parentPhone,
    eventId: b.meta_event_id,
    fbclid: b.attribution_last_touch?.fbclid ?? b.attribution_first_touch?.fbclid,
    customData: {
      content_name: "Waitlist",
      lead_id: leadId,
      waitlist_entry_id: row.id,
    },
  });
  if (leadId) {
    await recordLifecycleEvent(leadId, "waitlist_joined", { source: "/api/waitlist" });
    await enrollLeadInSequence({ leadId, triggerType: "waitlist_joined" });
  }

  /**
   * Approved operational mirror only — queue Airtable sync job after PHI filter.
   * Background worker would pick `airtable_sync_jobs` rows; MVP triggers manually from admin.
   */

  return NextResponse.json({ ok: true, id: row.id });
}
