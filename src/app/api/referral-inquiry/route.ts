import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";
import { enqueueAirtablePush } from "@/lib/airtable/airtable-sync-queue";
import { referralInquiryConfirmationEmailHtml } from "@/lib/email/email-templates";
import { sendOperationalEmail } from "@/lib/email/send-transactional-email";
import { logEmailEvent } from "@/lib/email/email-event-log";
import { mapReferralInquiryPayload } from "@/lib/zapier/zapier-payload-mapper";
import { queueZapierOutbound } from "@/lib/zapier/outbound-webhooks";
import { clientIpFromHeaders } from "@/lib/http/client-ip";
import { attachAttributionToLead } from "@/lib/marketing/attribution";
import { upsertMarketingLead } from "@/lib/leads/marketing-lead-upsert";
import { recordLifecycleEvent } from "@/lib/marketing/lifecycle";
import { enrollLeadInSequence } from "@/lib/marketing/sequences";

const schema = z.object({
  organizationName: z.string().min(1).max(200),
  contactName: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  partnerType: z.string().min(1).max(80),
  city: z.string().min(1).max(120),
  message: z.string().max(2000).optional(),
  consentPrivacy: z.boolean(),
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
  let leadId: string | null = null;

  try {
    const up = await upsertMarketingLead(supabase, {
      parent_name: b.contactName,
      parent_email: b.email,
      parent_phone: b.phone ?? null,
      city_or_zip: b.city,
      child_age_range: null,
      main_concern: `Referral partner inquiry: ${b.organizationName}`,
      lead_source: "referral_partner",
      form_type: "referral_inquiry",
      consent_marketing: true,
      consent_privacy: true,
      parent_first_name: b.contactName.split(" ")[0] ?? b.contactName,
      parent_last_name: b.contactName.split(" ").slice(1).join(" ") || null,
      consent_ip: ip,
    });
    leadId = up.leadId;
  } catch {
    leadId = null;
  }

  const { data: row, error } = await supabase
    .from("referral_inquiries")
    .insert({
      organization_name: b.organizationName,
      contact_name: b.contactName,
      email: b.email.trim().toLowerCase(),
      phone: b.phone ?? null,
      partner_type: b.partnerType,
      city: b.city,
      message: b.message ?? null,
      consent_contact: true,
      status: "new",
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error(error);
    return NextResponse.json({ error: "Could not save inquiry" }, { status: 500 });
  }

  const referralInquiryId = row.id as string;

  await supabase.from("consent_logs").insert({
    lead_id: null,
    consent_type: "referral_partner_privacy_ack",
    language_snippet: "referral_inquiry_v1",
    source_page: "/api/referral-inquiry",
    email: b.email.trim().toLowerCase(),
    ip,
  });

  const mail = await sendOperationalEmail({
    to: b.email.trim().toLowerCase(),
    subject: "Thanks for your interest in partnering",
    html: referralInquiryConfirmationEmailHtml({
      contactName: b.contactName,
      organizationName: b.organizationName,
    }),
    tags: [{ name: "referral_inquiry_id", value: referralInquiryId }],
  });

  const dispatch_status = mail.sendError
    ? ("failed" as const)
    : mail.dryRun && mail.skippedReason === "email_not_configured"
      ? ("skipped_no_provider" as const)
      : mail.dryRun
        ? ("dry_run" as const)
        : ("sent" as const);

  await logEmailEvent({
    lead_id: null,
    template_key: "referral_inquiry_confirmation",
    dispatch_status,
    resend_email_id: mail.resendEmailId,
    related_table: "referral_inquiries",
    related_record_id: referralInquiryId,
    error_message: mail.sendError ?? null,
    metadata: { skipped_reason: mail.skippedReason },
  });

  /** Airtable summary omits verbose message body from sync payload summary. */
  await enqueueAirtablePush({
    sourceTable: "referral_inquiries",
    sourceRecordId: referralInquiryId,
    targetAirtableTable: "Referral Inquiries",
    safePayloadSummary: {
      inquiry_id: referralInquiryId,
      organization_name: b.organizationName,
      contact_name: b.contactName,
      partner_email: b.email.trim().toLowerCase(),
      partner_phone: b.phone ?? undefined,
      partner_type: b.partnerType,
      city: b.city,
    },
    dryRun: false,
  });

  const mapped = mapReferralInquiryPayload({
    id: referralInquiryId,
    organization_name: b.organizationName,
    contact_name: b.contactName,
    email: b.email.trim().toLowerCase(),
    phone: b.phone ?? null,
    partner_type: b.partnerType,
    city: b.city,
  });

  queueZapierOutbound({
    zapKey: "referral_inquiry",
    payload: mapped.data,
    logExtras: {
      stripped_keys: mapped.strippedKeys,
      has_message_attachment: Boolean(b.message?.trim()),
    },
    auditEventType: "referral_inquiry_created",
    containsParentChildData: false,
    phiRiskLevel: mapped.phiRiskSuggestion,
    approvalRequired: false,
    approvalStatus: "not_required",
  });

  await attachAttributionToLead({
    leadId,
    email: b.email.trim().toLowerCase(),
    req,
    eventType: "referral_partner_inquiry",
    sourceRoute: "/api/referral-inquiry",
    metadata: {
      referral_inquiry_id: referralInquiryId,
      attribution_first_touch: b.attribution_first_touch ?? {},
      attribution_last_touch: b.attribution_last_touch ?? {},
    },
  });
  if (leadId) {
    await recordLifecycleEvent(leadId, "referral_partner", { source: "/api/referral-inquiry" });
    await enrollLeadInSequence({ leadId, triggerType: "referral_partner_inquiry" });
  }

  return NextResponse.json({
    ok: true,
    referralInquiryId,
    ...(mail.sendError ? { warning: `email_issue:${mail.sendError}` } : {}),
  });
}
