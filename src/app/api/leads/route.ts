import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";
import { resultEmailHtml } from "@/lib/email-templates";
import { sendTransactionalEmail } from "@/lib/mail";
import { writeAuditLog } from "@/lib/audit";
import {
  computeFirstNurtureSend,
  computeReminder48h,
  pickSequenceForCategory,
} from "@/lib/nurture";
import { sendSmsIfConfigured } from "@/lib/sms";
import type { ResultCategory } from "@/types/database";
import { enqueueAirtablePush } from "@/lib/airtable/airtable-sync-queue";
import { parseParentName } from "@/lib/leads/lead-normalizer";
import { mapLeadCreatedPayload } from "@/lib/zapier/zapier-payload-mapper";
import { queueZapierOutbound } from "@/lib/zapier/outbound-webhooks";
import { queueSlackNewLeadAlert } from "@/lib/slack/slack-webhook";
import { attachAttributionToLead } from "@/lib/marketing/attribution";
import { recordLifecycleEvent } from "@/lib/marketing/lifecycle";
import { enrollLeadInSequence } from "@/lib/marketing/sequences";
import { trySendMetaConversion } from "@/lib/meta/conversions-api";

const leadSchema = z.object({
  parentName: z.string().min(1).max(200),
  parentEmail: z.string().email(),
  parentPhone: z.string().max(30).optional(),
  childAgeRange: z.string().min(1).max(80),
  cityOrZip: z.string().min(1).max(120),
  mainConcern: z.string().min(1).max(2000),
  consentMarketing: z.boolean(),
  consentPrivacy: z.boolean(),
  primaryCategory: z.string(),
  scores: z.record(z.string(), z.number()),
  quizAnswers: z.array(
    z.object({
      questionId: z.string(),
      category: z.string(),
      value: z.number(),
    })
  ),
  sessionId: z.string().optional(),
  referralCode: z.string().optional(),
  meta_event_id: z.string().optional(),
  attribution_first_touch: z.record(z.string(), z.string()).optional(),
  attribution_last_touch: z.record(z.string(), z.string()).optional(),
});

function getClientIp(h: Headers): string | null {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    null
  );
}

export async function POST(req: Request) {
  const env = getEnv();
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Server is not fully configured" },
      { status: 503 }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body = parsed.data;
  if (!body.consentPrivacy) {
    return NextResponse.json(
      { error: "Privacy acknowledgment is required" },
      { status: 400 }
    );
  }

  const primary = body.primaryCategory as ResultCategory;
  const ip = getClientIp(req.headers);
  const now = new Date().toISOString();
  const supabase = createAdminClient();

  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .insert({
      parent_name: body.parentName,
      parent_email: body.parentEmail,
      parent_phone: body.parentPhone || null,
      child_age_range: body.childAgeRange,
      city_or_zip: body.cityOrZip,
      main_concern: body.mainConcern,
      consent_marketing: body.consentMarketing,
      consent_privacy_ack: body.consentPrivacy,
      consent_at: now,
      consent_source: "lead_form",
      consent_ip: ip,
      primary_result_category: primary,
      nurture_stopped: false,
      reminder_48h_at: computeReminder48h().toISOString(),
    })
    .select("id, unsubscribe_token")
    .single();

  if (leadErr || !lead) {
    console.error(leadErr);
    return NextResponse.json({ error: "Could not save lead" }, { status: 500 });
  }

  const leadId = lead.id as string;
  const normalizedEmail = body.parentEmail.trim().toLowerCase();

  const answersRows = body.quizAnswers.map((a) => ({
    lead_id: leadId,
    session_id: body.sessionId ?? null,
    question_id: a.questionId,
    category: a.category,
    answer_value: a.value,
  }));
  if (answersRows.length) {
    await supabase.from("quiz_answers").insert(answersRows);
  }

  await supabase.from("quiz_results").insert({
    lead_id: leadId,
    session_id: body.sessionId ?? null,
    primary_category: primary,
    scores: body.scores,
  });

  if (body.referralCode) {
    const { data: ref } = await supabase
      .from("campaign_codes")
      .select("id")
      .eq("code", body.referralCode)
      .maybeSingle();
    if (ref) {
      await supabase
        .from("campaign_codes")
        .update({ lead_id: leadId })
        .eq("id", ref.id);
    }
  }

  const seq = await pickSequenceForCategory(primary);
  const firstNurture = computeFirstNurtureSend();
  await supabase
    .from("leads")
    .update({
      nurture_sequence_id: seq?.id ?? null,
      nurture_current_step: 0,
      nurture_next_send_at: firstNurture.toISOString(),
    })
    .eq("id", leadId);

  const baseUrl = getEnv().NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const unsubUrl = `${baseUrl.replace(/\/$/, "")}/api/unsubscribe?token=${encodeURIComponent(lead.unsubscribe_token as string)}`;

  const welcome = await sendTransactionalEmail({
    to: body.parentEmail,
    subject: "Your nature-based OT guide results (educational only)",
    html: resultEmailHtml(body.parentName, primary, unsubUrl),
    tags: [{ name: "lead_id", value: leadId }, { name: "type", value: "result" }],
  });

  await supabase.from("email_events").insert({
    lead_id: leadId,
    resend_email_id: welcome.id,
    event_type: welcome.id ? "sent" : "send_failed",
    step_index: null,
    metadata: { type: "result_email" },
  });

  if (
    body.consentMarketing &&
    body.parentPhone &&
    env.NEXT_PUBLIC_APP_URL
  ) {
    await sendSmsIfConfigured({
      toE164: body.parentPhone.startsWith("+")
        ? body.parentPhone
        : `+1${body.parentPhone.replace(/\D/g, "")}`,
      body: `Texas Nature OT: Thanks for your interest. Book a call when you're ready: ${env.NEXT_PUBLIC_APP_URL}/book Reply STOP to opt out.`,
    }).catch(() => {});
  }

  await writeAuditLog({
    action: "lead_created",
    resourceType: "leads",
    resourceId: leadId,
    details: { source: "funnel" },
    ip,
  });

  const parsedName = parseParentName(body.parentName);

  await enqueueAirtablePush({
    sourceTable: "leads",
    sourceRecordId: leadId,
    targetAirtableTable: "Leads",
    safePayloadSummary: {
      lead_id: leadId,
      parent_name: parsedName.parent_name,
      parent_first_name: parsedName.parent_first_name,
      parent_email: body.parentEmail.trim().toLowerCase(),
      parent_phone: body.parentPhone ?? undefined,
      child_age_range: body.childAgeRange,
      city_or_zip: body.cityOrZip,
      primary_result_category: primary,
      lead_source: "lead_form",
      consent_marketing: body.consentMarketing,
    },
    dryRun: false,
  });

  const mappedLead = mapLeadCreatedPayload({
    id: leadId,
    parent_email: body.parentEmail,
    parent_name: body.parentName,
    parent_phone: body.parentPhone,
    child_age_range: body.childAgeRange,
    city_or_zip: body.cityOrZip,
    primary_result_category: primary,
    lead_source: "lead_form",
    consent_marketing: body.consentMarketing,
  });

  queueZapierOutbound({
    zapKey: "new_lead",
    payload: mappedLead.data,
    logExtras: { stripped_keys: mappedLead.strippedKeys },
    containsParentChildData: true,
    phiRiskLevel: mappedLead.phiRiskSuggestion,
    approvalRequired: false,
    approvalStatus: "not_required",
  });

  queueSlackNewLeadAlert({
    lead_id: leadId,
    parent_name: body.parentName,
    parent_email: body.parentEmail,
    parent_phone: body.parentPhone,
    child_age_range: body.childAgeRange,
    city_or_zip: body.cityOrZip,
    primary_result_category: primary,
    lead_source: "lead_form",
    consent_marketing: body.consentMarketing,
  });

  await attachAttributionToLead({
    leadId,
    email: normalizedEmail,
    req,
    eventType: "lead_created",
    sourceRoute: "/api/leads",
    metadata: {
      attribution_first_touch: body.attribution_first_touch ?? {},
      attribution_last_touch: body.attribution_last_touch ?? {},
      form_type: "quiz_lead_form",
      meta_event_id: body.meta_event_id ?? null,
    },
  });
  await trySendMetaConversion({
    req,
    eventName: "Lead",
    email: body.parentEmail,
    phone: body.parentPhone,
    eventId: body.meta_event_id,
    fbclid: body.attribution_last_touch?.fbclid ?? body.attribution_first_touch?.fbclid,
    customData: {
      content_name: "Quiz lead form",
      content_category: primary,
      lead_id: leadId,
    },
  });
  await recordLifecycleEvent(leadId, "quiz_completed", { source: "/api/leads" });
  await enrollLeadInSequence({ leadId, triggerType: "quiz_completed" });

  return NextResponse.json({
    ok: true,
    leadId,
    unsubscribeToken: lead.unsubscribe_token,
  });
}
