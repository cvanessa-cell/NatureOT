import type { SupabaseClient } from "@supabase/supabase-js";

export type MarketingLeadUpsertInput = {
  parent_name: string;
  parent_email: string;
  parent_phone?: string | null;
  city_or_zip: string | null;
  child_age_range?: string | null;
  /** Short ops description when capture has no quiz concern. */
  main_concern?: string | null;
  lead_source: string;
  form_type: string;
  consent_marketing: boolean;
  consent_privacy: boolean;
  parent_first_name?: string | null;
  parent_last_name?: string | null;
  consent_ip?: string | null;
};

/** Re-use lead row per email — prefers minimum duplicate operational rows. */
export async function upsertMarketingLead(
  supabase: SupabaseClient,
  input: MarketingLeadUpsertInput
): Promise<{ leadId: string; created: boolean }> {
  const nowIso = new Date().toISOString();
  const email = input.parent_email.trim().toLowerCase();
  const cityOrZip = input.city_or_zip?.trim() ? input.city_or_zip.trim() : "—";

  const { data: existing } = await supabase
    .from("leads")
    .select("id, parent_phone")
    .eq("parent_email", email)
    .maybeSingle();

  if (existing?.id) {
    const lid = existing.id as string;
    const mergedPhone =
      input.parent_phone ??
      ((existing as { parent_phone?: string | null }).parent_phone ?? null);

    const patch: Record<string, unknown> = {
      parent_name: input.parent_name,
      parent_phone: mergedPhone,
      parent_first_name: input.parent_first_name ?? null,
      parent_last_name: input.parent_last_name ?? null,
      lead_source: input.lead_source,
      form_type: input.form_type,
      city_or_zip: cityOrZip,
      consent_marketing: input.consent_marketing,
      consent_privacy_ack: input.consent_privacy,
      consent_at: nowIso,
      consent_ip: input.consent_ip ?? null,
      updated_at: nowIso,
    };
    if (input.child_age_range) patch.child_age_range = input.child_age_range;
    if (input.main_concern) patch.main_concern = input.main_concern;

    await supabase.from("leads").update(patch as never).eq("id", lid);
    return { leadId: lid, created: false };
  }

  const { data: row, error } = await supabase
    .from("leads")
    .insert({
      parent_name: input.parent_name,
      parent_email: email,
      parent_phone: input.parent_phone ?? null,
      parent_first_name: input.parent_first_name ?? null,
      parent_last_name: input.parent_last_name ?? null,
      child_age_range: input.child_age_range ?? null,
      city_or_zip: cityOrZip,
      main_concern: input.main_concern ?? "Marketing capture",
      consent_marketing: input.consent_marketing,
      consent_privacy_ack: input.consent_privacy,
      consent_source: input.form_type,
      consent_ip: input.consent_ip ?? null,
      consent_at: nowIso,
      lead_source: input.lead_source,
      form_type: input.form_type,
      nurture_stopped: true,
      nurture_stopped_reason: "marketing_capture",
      nurture_next_send_at: null,
      nurture_sequence_id: null,
    })
    .select("id")
    .single();

  if (error || !row) throw new Error(error?.message ?? "lead insert failed");
  return { leadId: row.id as string, created: true };
}
