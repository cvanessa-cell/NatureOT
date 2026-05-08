import { createAdminClient } from "@/lib/supabase/admin";

function includesAny(haystack: string, needles: string[]): boolean {
  const normalized = haystack.toLowerCase();
  return needles.some((n) => normalized.includes(n));
}

export async function refreshLeadSegments(leadId: string) {
  const supabase = createAdminClient();
  const [{ data: lead }, { data: lifecycle }, { data: segments }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, lead_source, form_type, main_concern, city_or_zip, unsubscribed_at")
      .eq("id", leadId)
      .maybeSingle(),
    supabase
      .from("lead_lifecycle_events")
      .select("lifecycle_stage")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false }),
    supabase.from("lead_segments").select("id,name"),
  ]);

  if (!lead || !segments) return;

  const lifecycleStages = (lifecycle ?? []).map((x) => x.lifecycle_stage as string);
  const textBlob = [
    lead.lead_source,
    lead.form_type,
    lead.main_concern,
    lead.city_or_zip,
    lifecycleStages.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const names = new Set<string>();
  if (includesAny(textBlob, ["homeschool"])) names.add("Homeschool Families");
  if (includesAny(textBlob, ["sensory", "regulation"])) names.add("Sensory Regulation Interest");
  if (includesAny(textBlob, ["outdoor confidence"])) names.add("Outdoor Confidence Interest");
  if (includesAny(textBlob, ["motor"])) names.add("Motor Skills Interest");
  if (includesAny(textBlob, ["social participation"])) names.add("Social Participation Interest");
  if (lifecycleStages.includes("workshop_registered")) names.add("Workshop Leads");
  if (lifecycleStages.includes("guide_downloaded")) names.add("Parent Guide Leads");
  if (lifecycleStages.includes("quiz_completed")) names.add("Quiz Leads");
  if (lifecycleStages.includes("waitlist_joined")) names.add("Waitlist Leads");
  if (lifecycleStages.includes("referral_partner")) names.add("Referral Partners");
  if (lifecycleStages.some((s) => ["book_call_clicked", "call_booked", "workshop_registered", "referral_partner"].includes(s))) {
    names.add("High Intent Leads");
  }
  if (lifecycleStages.includes("inactive")) names.add("Inactive Leads");
  if (lead.unsubscribed_at || lifecycleStages.includes("unsubscribed")) names.add("Unsubscribed");

  for (const segment of segments) {
    if (!names.has(segment.name)) continue;
    await supabase.from("lead_segment_members").upsert(
      {
        lead_id: leadId,
        segment_id: segment.id,
        reason: "auto_refresh",
      },
      { onConflict: "lead_id,segment_id", ignoreDuplicates: true }
    );
  }
}
