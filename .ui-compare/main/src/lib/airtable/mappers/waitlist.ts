/**
 * Map Supabase waitlist → Airtable field names.
 *
 * IMPORTANT: Align these string literals with your Airtable "Waitlist Overview" base columns.
 * Rename keys here when your base schema changes — never paste PHI columns into Airtable.
 */

export const WAITLIST_AIRTABLE_ALLOWLIST = [
  "Supabase ID",
  "Parent Email",
  "Parent Name",
  "Child Age Range",
  "City or ZIP",
  "Preferred Schedule",
  "Interest Areas",
  "Status",
  "General Notes",
  "Synced At",
] as const;

export type WaitlistMirrorFields = Record<(typeof WAITLIST_AIRTABLE_ALLOWLIST)[number], unknown>;

export function mapWaitlistRowToAirtable(row: {
  id: string;
  parent_email: string;
  parent_name: string;
  child_age_range: string;
  city_or_zip: string;
  preferred_schedule: string | null;
  interest_areas: string[] | null;
  status: string;
  general_notes: string | null;
}): Record<string, unknown> {
  return {
    "Supabase ID": row.id,
    "Parent Email": row.parent_email,
    "Parent Name": row.parent_name,
    "Child Age Range": row.child_age_range,
    "City or ZIP": row.city_or_zip,
    "Preferred Schedule": row.preferred_schedule ?? "",
    "Interest Areas": (row.interest_areas ?? []).join(", "),
    Status: row.status,
    "General Notes": row.general_notes ?? "",
    "Synced At": new Date().toISOString(),
  };
}
