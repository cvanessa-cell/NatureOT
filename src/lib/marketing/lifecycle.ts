import { createAdminClient } from "@/lib/supabase/admin";
import { refreshLeadSegments } from "@/lib/marketing/segments";

export type LifecycleStage =
  | "new_lead"
  | "guide_downloaded"
  | "quiz_completed"
  | "waitlist_joined"
  | "workshop_registered"
  | "book_call_clicked"
  | "call_booked"
  | "referral_partner"
  | "intake_started"
  | "converted_client"
  | "inactive"
  | "unsubscribed";

export async function getCurrentLifecycleStage(leadId: string): Promise<LifecycleStage | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("lead_lifecycle_events")
      .select("lifecycle_stage")
      .order("created_at", { ascending: false })
      .limit(1)
      .eq("lead_id", leadId)
      .maybeSingle();
    return (data?.lifecycle_stage as LifecycleStage | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function stopMarketingForBookedOrUnsubscribedLead(leadId: string) {
  const supabase = createAdminClient();
  await supabase
    .from("marketing_sequence_enrollments")
    .update({
      status: "stopped",
      completed_at: new Date().toISOString(),
      stopped_reason: "lifecycle_stop",
    })
    .eq("lead_id", leadId)
    .in("status", ["active", "paused"]);
}

export async function recordLifecycleEvent(
  leadId: string,
  lifecycleStage: LifecycleStage,
  metadata: Record<string, unknown> = {}
) {
  const supabase = createAdminClient();
  const previousStage = await getCurrentLifecycleStage(leadId);
  await supabase.from("lead_lifecycle_events").insert({
    lead_id: leadId,
    lifecycle_stage: lifecycleStage,
    previous_stage: previousStage,
    source: (metadata.source as string | undefined) ?? "api",
    notes: (metadata.notes as string | undefined) ?? null,
    metadata,
  });

  if (lifecycleStage === "call_booked" || lifecycleStage === "converted_client" || lifecycleStage === "unsubscribed") {
    await stopMarketingForBookedOrUnsubscribedLead(leadId);
  }

  try {
    await refreshLeadSegments(leadId);
  } catch {
    // Segment refresh should not break lead capture flows.
  }
}
