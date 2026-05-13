import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";
import { parseParentName } from "@/lib/leads/lead-normalizer";
import { upsertMarketingLead } from "@/lib/leads/marketing-lead-upsert";
import { enqueueAirtablePush } from "@/lib/airtable/airtable-sync-queue";
import {
  workshopRegistrationEmailHtml,
} from "@/lib/email/email-templates";
import { sendOperationalEmail } from "@/lib/email/send-transactional-email";
import { logEmailEvent } from "@/lib/email/email-event-log";
import { mapWorkshopRegistrationPayload } from "@/lib/zapier/zapier-payload-mapper";
import { queueZapierOutbound } from "@/lib/zapier/outbound-webhooks";
import { clientIpFromHeaders } from "@/lib/http/client-ip";
import { workshopTitleFromSlug } from "@/lib/workshops/workshop-catalog";
import { attachAttributionToLead } from "@/lib/marketing/attribution";
import { recordLifecycleEvent } from "@/lib/marketing/lifecycle";
import { enrollLeadInSequence } from "@/lib/marketing/sequences";
import { trySendMetaConversion } from "@/lib/meta/conversions-api";

const schema = z.object({
  parentName: z.string().min(1).max(200),
  parentEmail: z.string().email(),
  phone: z.string().max(30).optional(),
  workshopId: z.string().min(1).max(120),
  /** ISO 8601 start time when the scheduled workshop instance is known (anchors reminder nurture timing). */
  eventStartsAt: z.string().max(80).optional(),
  city: z.string().max(120).optional(),
  consentPrivacy: z.boolean(),
  consentReminders: z.boolean().optional(),
  meta_event_id: z.string().optional(),
  attribution_first_touch: z.record(z.string(), z.string()).optional(),
  attribution_last_touch: z.record(z.string(), z.string()).optional(),
});

export async function POST(req: Request) {
  if (!getEnv().SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const b = parsed.data;
  if (!b.consentPrivacy) {
    return NextResponse.json(
      { error: "Privacy acknowledgment is required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const ip = clientIpFromHeaders(req.headers);
  const parsedName = parseParentName(b.parentName);
  const cityOrZip = b.city?.trim() || null;
  const title = workshopTitleFromSlug(b.workshopId);

  let eventStartsAtIso: string | null = null;
  if (b.eventStartsAt?.trim()) {
    const parsed = new Date(b.eventStartsAt.trim());
    if (!Number.isNaN(parsed.getTime())) {
      eventStartsAtIso = parsed.toISOString();
    }
  }

  let leadId: string;
  try {
    const up = await upsertMarketingLead(supabase, {
      parent_name: parsedName.parent_name,
      parent_email: b.parentEmail,
      parent_phone: b.phone ?? null,
      city_or_zip: cityOrZip,
      child_age_range: null,
      main_concern: `Workshop interest: ${title}`,
      lead_source: "workshop_registration",
      form_type: "workshop_registration",
      consent_marketing: Boolean(b.consentReminders),
      consent_privacy: true,
      parent_first_name: parsedName.parent_first_name,
      parent_last_name: parsedName.parent_last_name,
      consent_ip: ip,
    });
    leadId = up.leadId;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not save lead" }, { status: 500 });
  }

  const { data: wr, error: wrErr } = await supabase
    .from("workshop_registrations")
    .insert({
      workshop_id: null,
      workshop_slug: b.workshopId,
      workshop_title: title,
      lead_id: leadId,
      parent_name: parsedName.parent_name,
      parent_email: b.parentEmail.trim().toLowerCase(),
      parent_phone: b.phone ?? null,
      child_age_range: null,
      status: "registered",
      ...(eventStartsAtIso ? { event_starts_at: eventStartsAtIso } : {}),
    })
    .select("id")
    .single();

  if (wrErr || !wr) {
    console.error(wrErr);
    return NextResponse.json({ error: "Could not save registration" }, { status: 500 });
  }

  const registrationId = wr.id as string;

  await supabase.from("consent_logs").insert({
    lead_id: leadId,
    consent_type: "workshop_privacy_and_optional_marketing",
    language_snippet: "workshop_registration_v1",
    source_page: "/api/workshop-registration",
    email: b.parentEmail.trim().toLowerCase(),
    ip,
  });

  const mail = await sendOperationalEmail({
    to: b.parentEmail.trim().toLowerCase(),
    subject: "You’re registered: Nature-Based OT Workshop",
    html: workshopRegistrationEmailHtml({
      parentName: parsedName.parent_name,
      workshopTitle: title,
    }),
    tags: [
      { name: "registration_id", value: registrationId },
      { name: "lead_id", value: leadId },
    ],
  });

  const dispatch_status = mail.sendError
    ? ("failed" as const)
    : mail.dryRun && mail.skippedReason === "email_not_configured"
      ? ("skipped_no_provider" as const)
      : mail.dryRun
        ? ("dry_run" as const)
        : ("sent" as const);

  await logEmailEvent({
    lead_id: leadId,
    template_key: "workshop_registration_confirmation",
    dispatch_status,
    resend_email_id: mail.resendEmailId,
    provider: "resend",
    related_table: "workshop_registrations",
    related_record_id: registrationId,
    error_message: mail.sendError ?? null,
    metadata: {
      dry_run: mail.dryRun,
      skipped_reason: mail.skippedReason,
    },
  });

  await enqueueAirtablePush({
    sourceTable: "workshop_registrations",
    sourceRecordId: registrationId,
    targetAirtableTable: "Workshop Registrations",
    safePayloadSummary: {
      registration_id: registrationId,
      lead_id: leadId,
      workshop_slug: b.workshopId,
      workshop_title: title,
      parent_email: b.parentEmail.trim().toLowerCase(),
      parent_phone: b.phone ?? undefined,
      city_hint: cityOrZip ?? undefined,
    },
    dryRun: false,
  });

  const mapped = mapWorkshopRegistrationPayload({
    id: registrationId,
    workshop_slug: b.workshopId,
    workshop_title: title,
    parent_name: parsedName.parent_name,
    parent_email: b.parentEmail.trim().toLowerCase(),
    parent_phone: b.phone ?? null,
    status: "registered",
    lead_id: leadId,
  });

  queueZapierOutbound({
    zapKey: "workshop_registration",
    payload: mapped.data,
    logExtras: { stripped_keys: mapped.strippedKeys },
    auditEventType: "workshop_registration_created",
    containsParentChildData: true,
    phiRiskLevel: mapped.phiRiskSuggestion,
    approvalRequired: false,
    approvalStatus: "not_required",
  });

  await attachAttributionToLead({
    leadId,
    email: b.parentEmail.trim().toLowerCase(),
    req,
    eventType: "workshop_registered",
    sourceRoute: "/api/workshop-registration",
    metadata: {
      workshop_registration_id: registrationId,
      workshop_slug: b.workshopId,
      attribution_first_touch: b.attribution_first_touch ?? {},
      attribution_last_touch: b.attribution_last_touch ?? {},
      meta_event_id: b.meta_event_id ?? null,
    },
  });
  await trySendMetaConversion({
    req,
    eventName: "CompleteRegistration",
    email: b.parentEmail,
    phone: b.phone,
    eventId: b.meta_event_id,
    fbclid: b.attribution_last_touch?.fbclid ?? b.attribution_first_touch?.fbclid,
    customData: {
      content_name: "Workshop registration",
      content_category: b.workshopId,
      lead_id: leadId,
      workshop_registration_id: registrationId,
    },
  });
  await recordLifecycleEvent(leadId, "workshop_registered", { source: "/api/workshop-registration" });
  await enrollLeadInSequence({ leadId, triggerType: "workshop_registered" });

  return NextResponse.json({
    ok: true,
    registrationId,
    leadId,
    ...(mail.sendError ? { warning: `email_issue:${mail.sendError}` } : {}),
  });
}
