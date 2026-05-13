import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";
import { parseParentName } from "@/lib/leads/lead-normalizer";
import { upsertMarketingLead } from "@/lib/leads/marketing-lead-upsert";
import { enqueueAirtablePush } from "@/lib/airtable/airtable-sync-queue";
import { parentGuideLeadEmailHtml } from "@/lib/email/email-templates";
import { sendOperationalEmail } from "@/lib/email/send-transactional-email";
import { logEmailEvent } from "@/lib/email/email-event-log";
import { mapParentGuideLeadPayload } from "@/lib/zapier/zapier-payload-mapper";
import { queueZapierOutbound } from "@/lib/zapier/outbound-webhooks";
import { clientIpFromHeaders } from "@/lib/http/client-ip";
import { attachAttributionToLead } from "@/lib/marketing/attribution";
import { recordLifecycleEvent } from "@/lib/marketing/lifecycle";
import { enrollLeadInSequence } from "@/lib/marketing/sequences";
import { trySendMetaConversion } from "@/lib/meta/conversions-api";

const GUIDE_NAME = "10 Outdoor Sensory Activities for Texas Kids";

const schema = z.object({
  parentName: z.string().min(1).max(200),
  parentEmail: z.string().email(),
  city: z.string().min(1).max(120),
  consentPrivacy: z.boolean(),
  consentGuide: z.boolean(),
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
  if (!b.consentPrivacy || !b.consentGuide) {
    return NextResponse.json(
      { error: "Consent checkboxes are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const ip = clientIpFromHeaders(req.headers);
  const parsedName = parseParentName(b.parentName);

  let leadId: string;
  try {
    const up = await upsertMarketingLead(supabase, {
      parent_name: parsedName.parent_name,
      parent_email: b.parentEmail,
      parent_phone: null,
      city_or_zip: b.city,
      child_age_range: null,
      main_concern: "Parent guide download",
      lead_source: "parent_guide",
      form_type: "parent_guide_lead",
      consent_marketing: true,
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

  const { data: gl, error: glErr } = await supabase
    .from("parent_guide_leads")
    .insert({
      lead_id: leadId,
      parent_first_name: parsedName.parent_first_name,
      parent_email: b.parentEmail.trim().toLowerCase(),
      city: b.city,
      consent_to_contact: true,
      guide_name: GUIDE_NAME,
    })
    .select("id")
    .single();

  if (glErr || !gl) {
    console.error(glErr);
    return NextResponse.json({ error: "Could not save guide request" }, { status: 500 });
  }

  const guideLeadId = gl.id as string;

  await supabase.from("consent_logs").insert({
    lead_id: leadId,
    consent_type: "parent_guide_educational_and_privacy",
    language_snippet: "parent_guide_v1",
    source_page: "/api/parent-guide-lead",
    email: b.parentEmail.trim().toLowerCase(),
    ip,
  });

  const mail = await sendOperationalEmail({
    to: b.parentEmail.trim().toLowerCase(),
    subject: "Your outdoor sensory activity guide",
    html: parentGuideLeadEmailHtml({ parentName: parsedName.parent_name }),
    tags: [
      { name: "lead_id", value: leadId },
      { name: "parent_guide_lead_id", value: guideLeadId },
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
    template_key: "parent_guide_delivery",
    dispatch_status,
    resend_email_id: mail.resendEmailId,
    related_table: "parent_guide_leads",
    related_record_id: guideLeadId,
    error_message: mail.sendError ?? null,
    metadata: {
      skipped_reason: mail.skippedReason,
      guide_name: GUIDE_NAME,
    },
  });

  await enqueueAirtablePush({
    sourceTable: "leads",
    sourceRecordId: leadId,
    targetAirtableTable: "Leads",
    safePayloadSummary: {
      lead_id: leadId,
      guide_lead_id: guideLeadId,
      parent_email: b.parentEmail.trim().toLowerCase(),
      city: b.city,
      source: "parent_guide",
      guide_name: GUIDE_NAME,
    },
    dryRun: false,
  });

  const mapped = mapParentGuideLeadPayload({
    guide_lead_id: guideLeadId,
    lead_id: leadId,
    parent_email: b.parentEmail.trim().toLowerCase(),
    parent_first_name: parsedName.parent_first_name,
    city: b.city,
    guide_name: GUIDE_NAME,
  });

  queueZapierOutbound({
    zapKey: "parent_guide_lead",
    payload: mapped.data,
    logExtras: { stripped_keys: mapped.strippedKeys },
    auditEventType: "parent_guide_lead_created",
    containsParentChildData: true,
    phiRiskLevel: mapped.phiRiskSuggestion,
    approvalRequired: false,
    approvalStatus: "not_required",
  });

  await attachAttributionToLead({
    leadId,
    email: b.parentEmail.trim().toLowerCase(),
    req,
    eventType: "guide_downloaded",
    sourceRoute: "/api/parent-guide-lead",
    metadata: {
      parent_guide_lead_id: guideLeadId,
      attribution_first_touch: b.attribution_first_touch ?? {},
      attribution_last_touch: b.attribution_last_touch ?? {},
      meta_event_id: b.meta_event_id ?? null,
    },
  });
  await trySendMetaConversion({
    req,
    eventName: "Lead",
    email: b.parentEmail,
    eventId: b.meta_event_id,
    fbclid: b.attribution_last_touch?.fbclid ?? b.attribution_first_touch?.fbclid,
    customData: {
      content_name: "Parent guide",
      lead_id: leadId,
      parent_guide_lead_id: guideLeadId,
    },
  });
  await recordLifecycleEvent(leadId, "guide_downloaded", { source: "/api/parent-guide-lead" });
  await enrollLeadInSequence({ leadId, triggerType: "parent_guide_download" });

  return NextResponse.json({
    ok: true,
    leadId,
    guideLeadId,
    ...(mail.sendError ? { warning: `email_issue:${mail.sendError}` } : {}),
  });
}
