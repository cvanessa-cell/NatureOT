import { createAdminClient } from "@/lib/supabase/admin";
import { appBaseUrl, getEnv } from "@/lib/env";
import { mergeTemplate } from "@/lib/email-templates";
import { CATEGORY_LABELS } from "@/lib/quiz-data";
import { sendTransactionalEmail } from "@/lib/mail";
import type { EmailStep, ResultCategory } from "@/types/database";

export async function pickSequenceForCategory(
  primary: ResultCategory
): Promise<{ id: string; steps: EmailStep[] } | null> {
  const supabase = createAdminClient();
  const slug = `nurture-${primary.replace(/_/g, "-")}`;
  const { data: byCat } = await supabase
    .from("email_sequences")
    .select("id, steps")
    .eq("category_slug", primary)
    .eq("is_active", true)
    .maybeSingle();
  if (byCat?.id && byCat.steps) {
    return { id: byCat.id, steps: byCat.steps as EmailStep[] };
  }
  const { data: named } = await supabase
    .from("email_sequences")
    .select("id, steps")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (named?.id && named.steps) {
    return { id: named.id, steps: named.steps as EmailStep[] };
  }
  const { data: def } = await supabase
    .from("email_sequences")
    .select("id, steps")
    .eq("slug", "default-nurture")
    .eq("is_active", true)
    .maybeSingle();
  if (def?.id && def.steps) {
    return { id: def.id, steps: def.steps as EmailStep[] };
  }
  return null;
}

export function computeFirstNurtureSend(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return d;
}

export function computeReminder48h(): Date {
  const d = new Date();
  d.setHours(d.getHours() + 48);
  return d;
}

export async function sendNurtureStepEmail(params: {
  leadId: string;
  email: string;
  parentName: string;
  primaryCategory: ResultCategory;
  step: EmailStep;
  stepIndex: number;
}): Promise<{ resendId: string | null }> {
  const base = appBaseUrl();
  const bookUrl = `${base}/book`;
  const unsubscribeUrl = `${base}/api/unsubscribe?token=`;
  const { data: lead } = await createAdminClient()
    .from("leads")
    .select("unsubscribe_token")
    .eq("id", params.leadId)
    .single();
  const token = lead?.unsubscribe_token as string | undefined;
  const unsub = token ? `${base}/api/unsubscribe?token=${encodeURIComponent(token)}` : `${base}/privacy`;

  const html = mergeTemplate(params.step.bodyHtml, {
    parent_name: params.parentName,
    primary_category: CATEGORY_LABELS[params.primaryCategory],
    book_url: bookUrl,
    unsubscribe_url: unsub,
  });

  const env = getEnv();
  const withFooter = `${html}<hr/><p style="font-size:12px;color:#555">You received this because you opted in on our website. <a href="${unsub}">Unsubscribe</a>. Texas Nature OT — educational information only; not a medical evaluation.</p>`;

  const { id } = await sendTransactionalEmail({
    to: params.email,
    subject: params.step.subject,
    html: withFooter,
    tags: [
      { name: "lead_id", value: params.leadId },
      { name: "step", value: String(params.stepIndex) },
    ],
  });

  const supabase = createAdminClient();
  await supabase.from("email_events").insert({
    lead_id: params.leadId,
    resend_email_id: id,
    event_type: id ? "sent" : "send_failed",
    step_index: params.stepIndex,
    metadata: { subject: params.step.subject },
  });

  return { resendId: id };
}

export async function sendReminder48hEmail(params: {
  leadId: string;
  email: string;
  parentName: string;
}): Promise<void> {
  const base = appBaseUrl();
  const { data: lead } = await createAdminClient()
    .from("leads")
    .select("unsubscribe_token")
    .eq("id", params.leadId)
    .single();
  const token = lead?.unsubscribe_token as string | undefined;
  const unsub = token ? `${base}/api/unsubscribe?token=${encodeURIComponent(token)}` : `${base}/privacy`;
  const html = `
    <p>Hi ${params.parentName.replace(/</g, "")},</p>
    <p>We wanted to follow up in case you still had questions about our nature-based pediatric occupational therapy groups in Texas.</p>
    <p>This message is informational only and does not create a treatment relationship. Individual experiences vary; we do not promise outcomes.</p>
    <p><a href="${base}/book">Schedule a short call</a> when it works for you.</p>
    <p style="font-size:12px"><a href="${unsub}">Unsubscribe</a></p>
  `;
  const { id } = await sendTransactionalEmail({
    to: params.email,
    subject: "A gentle follow-up from Texas Nature OT",
    html,
    tags: [{ name: "lead_id", value: params.leadId }, { name: "type", value: "reminder_48h" }],
  });
  await createAdminClient().from("email_events").insert({
    lead_id: params.leadId,
    resend_email_id: id,
    event_type: id ? "sent" : "send_failed",
    step_index: null,
    metadata: { kind: "reminder_48h" },
  });
}
