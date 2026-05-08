import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/mail";

export type TriggerType =
  | "parent_guide_download"
  | "quiz_completed"
  | "waitlist_joined"
  | "workshop_registered"
  | "book_call_abandoned"
  | "referral_partner_inquiry"
  | "manual";

/** Parsed from marketing_sequence_steps.schedule_metadata JSON */
type ScheduleTiming = "before_lead_event" | "after_lead_event";

export type MarketingSequenceStepRow = {
  id: string;
  sequence_id: string;
  step_order: number;
  delay_hours: number;
  channel: "email" | "sms" | "admin_task";
  subject?: string | null;
  body: string;
  cta_label?: string | null;
  cta_url?: string | null;
  is_active: boolean;
  schedule_metadata?: Record<string, unknown> | null;
};

export async function shouldSkipMarketingSend(lead: {
  unsubscribed_at?: string | null;
  consent_marketing?: boolean | null;
}) {
  return Boolean(lead.unsubscribed_at) || !lead.consent_marketing;
}

export async function hasSmsMarketingConsent(leadId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("marketing_consent_events")
    .select("id")
    .eq("lead_id", leadId)
    .eq("consent_type", "sms_marketing")
    .eq("consent_status", "granted")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}

export function renderMarketingTemplate(template: string, lead: { parent_name?: string | null; parent_email?: string | null }) {
  return template
    .replaceAll("{{parent_name}}", lead.parent_name ?? "there")
    .replaceAll("{{parent_email}}", lead.parent_email ?? "");
}

function readScheduleTiming(meta: Record<string, unknown> | null | undefined): { timing?: ScheduleTiming; hours?: number } {
  const timing = meta?.timing;
  const hours = meta?.hours;
  if (timing !== "before_lead_event" && timing !== "after_lead_event") return {};
  const h = typeof hours === "number" ? hours : Number(hours);
  return {
    timing: timing as ScheduleTiming,
    hours: Number.isFinite(h) ? Math.max(0, h) : 24,
  };
}

async function fetchLeadWorkshopEventStartIso(leadId: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("workshop_registrations")
    .select("event_starts_at")
    .eq("lead_id", leadId)
    .not("event_starts_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const raw = data?.event_starts_at as string | null | undefined;
  return raw ?? null;
}

/** Next send anchor after executing `step`; uses schedule_metadata event anchors when workshop event time exists. */
export async function computeNextSendAt(params: {
  leadId: string;
  completedStep: MarketingSequenceStepRow;
  subsequentStep?: MarketingSequenceStepRow | null;
}): Promise<string> {
  const next = params.subsequentStep;
  const now = new Date();
  if (!next) return new Date(now.getFullYear() + 1, 0, 1).toISOString();

  const meta = (next.schedule_metadata ?? {}) as Record<string, unknown>;
  const { timing, hours } = readScheduleTiming(meta);
  const eventIso = timing ? await fetchLeadWorkshopEventStartIso(params.leadId) : null;

  if (timing && eventIso) {
    const event = new Date(eventIso);
    if (timing === "before_lead_event") {
      const d = new Date(event.getTime() - hours! * 60 * 60 * 1000);
      return d <= now ? new Date(now.getTime() + 60 * 60 * 1000).toISOString() : d.toISOString();
    }
    const d = new Date(event.getTime() + hours! * 60 * 60 * 1000);
    return d <= now ? new Date(now.getTime() + 60 * 60 * 1000).toISOString() : d.toISOString();
  }

  const h = timing && !eventIso ? Math.max(next.delay_hours, 48, hours ?? 48) : Math.max(0, next.delay_hours);
  const d = new Date(now.getTime() + h * 60 * 60 * 1000);
  return d.toISOString();
}

export async function enrollLeadInSequence(input: { leadId: string; triggerType: TriggerType }) {
  const supabase = createAdminClient();
  const { data: sequence, error } = await supabase
    .from("marketing_sequences")
    .select("id,status")
    .eq("trigger_type", input.triggerType)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !sequence || sequence.status !== "active") return null;

  const { data: dupe } = await supabase
    .from("marketing_sequence_enrollments")
    .select("id")
    .eq("lead_id", input.leadId)
    .eq("sequence_id", sequence.id as string)
    .in("status", ["active", "paused"])
    .maybeSingle();
  if (dupe?.id) return null;

  const nowIso = new Date().toISOString();
  const { data: row, error: insErr } = await supabase
    .from("marketing_sequence_enrollments")
    .insert({
      lead_id: input.leadId,
      sequence_id: sequence.id,
      status: "active",
      current_step_order: 0,
      next_send_at: nowIso,
    })
    .select("*")
    .single();
  if (insErr) return null;
  return row;
}

export async function stopLeadSequences(input: { leadId: string; reason: string }) {
  const supabase = createAdminClient();
  await supabase
    .from("marketing_sequence_enrollments")
    .update({
      status: "stopped",
      completed_at: new Date().toISOString(),
      stopped_reason: input.reason,
    })
    .eq("lead_id", input.leadId)
    .in("status", ["active", "paused"]);
}

export async function getDueSequenceSteps(now = new Date()) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("marketing_sequence_enrollments")
    .select("*, marketing_sequences(id,status,name)")
    .eq("status", "active")
    .lte("next_send_at", now.toISOString())
    .order("next_send_at", { ascending: true })
    .limit(50);
  return data ?? [];
}

async function enforceSequenceStillActive(sequenceId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("marketing_sequences").select("status").eq("id", sequenceId).maybeSingle();
  return data?.status === "active";
}

export async function sendDueSequenceStep(enrollment: {
  id: string;
  lead_id: string;
  sequence_id: string;
  current_step_order: number;
}) {
  const supabase = createAdminClient();
  const sequenceOk = await enforceSequenceStillActive(enrollment.sequence_id);
  if (!sequenceOk) {
    await supabase.from("marketing_sequence_enrollments").update({ status: "paused", stopped_reason: "sequence_not_active" }).eq("id", enrollment.id);
    await supabase.from("marketing_messages").insert({
      lead_id: enrollment.lead_id,
      sequence_id: enrollment.sequence_id,
      channel: "email",
      status: "skipped",
      failure_reason: "sequence_paused_or_inactive",
    });
    return { status: "skipped" as const };
  }

  const [{ data: lead }, { data: steps }] = await Promise.all([
    supabase.from("leads").select("id,parent_name,parent_email,consent_marketing,unsubscribed_at").eq("id", enrollment.lead_id).single(),
    supabase
      .from("marketing_sequence_steps")
      .select("*")
      .eq("sequence_id", enrollment.sequence_id)
      .eq("is_active", true)
      .order("step_order", { ascending: true }),
  ]);

  const typedSteps = (steps ?? []) as MarketingSequenceStepRow[];
  if (!lead || typedSteps.length === 0)
    return { status: "blocked" as const };

  const currentIndex = typedSteps.findIndex((step) => step.step_order === enrollment.current_step_order);
  const nextIndex = currentIndex < 0 ? 0 : currentIndex;
  const step = typedSteps[nextIndex];
  if (!step) {
    await supabase
      .from("marketing_sequence_enrollments")
      .update({ status: "completed", completed_at: new Date().toISOString(), next_send_at: null })
      .eq("id", enrollment.id);
    return { status: "completed" as const };
  }

  const unsubscribed = Boolean(lead.unsubscribed_at);
  const blockEmailSms = unsubscribed || !lead.consent_marketing;
  let sendSkippedForConsent = false;
  if (step.channel === "email" && blockEmailSms) sendSkippedForConsent = true;
  if (step.channel === "sms" && (blockEmailSms || !(await hasSmsMarketingConsent(enrollment.lead_id)))) sendSkippedForConsent = true;
  if (unsubscribed && step.channel === "admin_task") sendSkippedForConsent = true;

  const body = renderMarketingTemplate(step.body, lead);
  let sendStatus: "sent" | "failed" | "skipped";
  let providerMessageId: string | null = null;
  let failureReason: string | null = sendSkippedForConsent ? "consent_or_unsubscribed_or_sms" : null;

  if (sendSkippedForConsent) {
    sendStatus = "skipped";
  } else if (step.channel === "email" && lead.parent_email) {
    try {
      const email = await sendTransactionalEmail({
        to: lead.parent_email,
        subject: step.subject ?? "TreeTots update",
        html: `<p>${body.replace(/\n/g, "</p><p>")}</p>`,
        tags: [{ name: "sequence_id", value: enrollment.sequence_id }],
      });
      providerMessageId = email.id ?? null;
      sendStatus = providerMessageId ? "sent" : "failed";
      failureReason = providerMessageId ? null : "provider_message_id_missing";
    } catch (error) {
      sendStatus = "failed";
      failureReason = error instanceof Error ? error.message : "send_failed";
    }
  } else if (step.channel === "admin_task") {
    sendStatus = "sent";
    failureReason = null;
  } else if (step.channel === "sms") {
    sendStatus = "skipped";
    failureReason = "sms_send_not_wired_requires_provider";
  } else {
    sendStatus = "skipped";
    failureReason = "missing_email";
  }

  await supabase.from("marketing_messages").insert({
    lead_id: enrollment.lead_id,
    sequence_id: enrollment.sequence_id,
    sequence_step_id: step.id,
    channel: step.channel,
    status: sendStatus,
    subject: step.subject ?? null,
    body_preview: body.slice(0, 320),
    provider_message_id: providerMessageId,
    failure_reason: failureReason,
    sent_at: sendStatus === "sent" ? new Date().toISOString() : null,
  });

  if (sendSkippedForConsent) {
    await supabase
      .from("marketing_sequence_enrollments")
      .update({
        status: "stopped",
        stopped_reason: failureReason ?? "consent_gate",
        next_send_at: null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", enrollment.id);
    return { status: "skipped" as const };
  }

  if (sendStatus === "skipped" && failureReason === "missing_email") {
    await supabase
      .from("marketing_sequence_enrollments")
      .update({
        status: "stopped",
        stopped_reason: "missing_email",
        next_send_at: null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", enrollment.id);
    return { status: "skipped" as const };
  }

  const nextStep = typedSteps[nextIndex + 1];
  if (!nextStep) {
    await supabase
      .from("marketing_sequence_enrollments")
      .update({
        current_step_order: step.step_order,
        status: "completed",
        next_send_at: null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", enrollment.id);
  } else {
    const nextSendIso = await computeNextSendAt({
      leadId: enrollment.lead_id,
      completedStep: step,
      subsequentStep: nextStep,
    });
    await supabase
      .from("marketing_sequence_enrollments")
      .update({
        current_step_order: nextStep.step_order,
        next_send_at: nextSendIso,
      })
      .eq("id", enrollment.id);
  }

  return { status: sendStatus };
}
