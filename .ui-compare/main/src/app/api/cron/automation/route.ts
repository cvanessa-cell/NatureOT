import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";
import {
  sendNurtureStepEmail,
  sendReminder48hEmail,
} from "@/lib/nurture";
import type { EmailStep, ResultCategory } from "@/types/database";

function authOk(req: Request): boolean {
  const env = getEnv();
  if (!env.CRON_SECRET) {
    // Dev-only: allow if secret unset (do not use in production)
    return process.env.NODE_ENV === "development";
  }
  const h = req.headers.get("authorization");
  if (h === `Bearer ${env.CRON_SECRET}`) return true;
  const q = new URL(req.url).searchParams.get("secret");
  return q === env.CRON_SECRET;
}

export async function GET(req: Request) {
  if (!authOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: dueNurture } = await supabase
    .from("leads")
    .select(
      "id, parent_email, parent_name, nurture_current_step, nurture_next_send_at, nurture_sequence_id, primary_result_category, consent_marketing, nurture_stopped, unsubscribed_at"
    )
    .eq("nurture_stopped", false)
    .is("unsubscribed_at", null)
    .eq("consent_marketing", true)
    .lte("nurture_next_send_at", now)
    .not("nurture_sequence_id", "is", null)
    .limit(25);

  const nurtureResults: string[] = [];
  for (const row of dueNurture ?? []) {
    const { data: booking } = await supabase
      .from("bookings")
      .select("id")
      .eq("lead_id", row.id)
      .limit(1)
      .maybeSingle();
    if (booking) {
      await supabase
        .from("leads")
        .update({
          nurture_stopped: true,
          nurture_stopped_reason: "booked",
        })
        .eq("id", row.id);
      nurtureResults.push(`${row.id}: stopped (booked)`);
      continue;
    }

    const { data: seq } = await supabase
      .from("email_sequences")
      .select("steps")
      .eq("id", row.nurture_sequence_id)
      .single();
    const steps = (seq?.steps as EmailStep[] | null) ?? [];
    const stepIndex = (row.nurture_current_step as number) ?? 0;
    if (stepIndex >= steps.length) {
      await supabase
        .from("leads")
        .update({ nurture_stopped: true, nurture_stopped_reason: "completed" })
        .eq("id", row.id);
      nurtureResults.push(`${row.id}: sequence complete`);
      continue;
    }

    const step = steps[stepIndex];
    const primary = (row.primary_result_category as ResultCategory) || "sensory_regulation";
    await sendNurtureStepEmail({
      leadId: row.id as string,
      email: row.parent_email as string,
      parentName: row.parent_name as string,
      primaryCategory: primary,
      step,
      stepIndex,
    });

    const next = new Date();
    if (stepIndex + 1 < steps.length) {
      const dayOffset = steps[stepIndex + 1].dayOffset - step.dayOffset;
      next.setDate(next.getDate() + Math.max(1, dayOffset));
    } else {
      next.setFullYear(next.getFullYear() + 1);
    }
    next.setHours(10, 0, 0, 0);

    await supabase
      .from("leads")
      .update({
        nurture_current_step: stepIndex + 1,
        nurture_next_send_at:
          stepIndex + 1 < steps.length ? next.toISOString() : null,
        nurture_stopped: stepIndex + 1 >= steps.length,
        nurture_stopped_reason:
          stepIndex + 1 >= steps.length ? "completed" : null,
      })
      .eq("id", row.id);

    nurtureResults.push(`${row.id}: sent step ${stepIndex}`);
  }

  const { data: dueReminder } = await supabase
    .from("leads")
    .select(
      "id, parent_email, parent_name, reminder_48h_at, reminder_48h_sent_at, nurture_stopped, consent_marketing"
    )
    .eq("nurture_stopped", false)
    .eq("consent_marketing", true)
    .is("reminder_48h_sent_at", null)
    .not("reminder_48h_at", "is", null)
    .lte("reminder_48h_at", now)
    .limit(25);

  const reminderResults: string[] = [];
  for (const row of dueReminder ?? []) {
    const { data: booking } = await supabase
      .from("bookings")
      .select("id")
      .eq("lead_id", row.id)
      .limit(1)
      .maybeSingle();
    if (booking) {
      await supabase
        .from("leads")
        .update({ reminder_48h_sent_at: now })
        .eq("id", row.id);
      reminderResults.push(`${row.id}: skip (booked)`);
      continue;
    }
    await sendReminder48hEmail({
      leadId: row.id as string,
      email: row.parent_email as string,
      parentName: row.parent_name as string,
    });
    await supabase
      .from("leads")
      .update({ reminder_48h_sent_at: now })
      .eq("id", row.id);
    reminderResults.push(`${row.id}: reminder sent`);
  }

  return NextResponse.json({
    ok: true,
    nurture: nurtureResults,
    reminders: reminderResults,
  });
}
