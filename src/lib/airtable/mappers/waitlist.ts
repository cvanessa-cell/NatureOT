/**
 * Map Supabase waitlist → Airtable field names.
 *
 * Column titles must match the TreeTots "Waitlist Entries" table in Airtable.
 */

export const WAITLIST_AIRTABLE_ALLOWLIST = [
  "Parent First Name",
  "Parent Email",
  "Parent Phone",
  "Child Age Range",
  "City",
  "ZIP",
  "Preferred Days",
  "Preferred Times",
  "General Interest Areas",
  "Status",
  "Consent Logged",
] as const;

export type WaitlistMirrorFields = Record<(typeof WAITLIST_AIRTABLE_ALLOWLIST)[number], unknown>;

/** Supabase waitlist_entries.status → Airtable single-select option. */
const WAITLIST_STATUS_TO_AIRTABLE: Record<string, string> = {
  active: "Waitlisted",
  waitlisted: "Waitlisted",
  new: "New",
  contacted: "Contacted",
  matched: "Matched",
  enrolled: "Enrolled",
  inactive: "Inactive",
};

export function mapWaitlistStatusToAirtable(status: string): string {
  const normalized = status.trim().toLowerCase();
  return WAITLIST_STATUS_TO_AIRTABLE[normalized] ?? "Waitlisted";
}

function splitCityZip(cityOrZip: string): { city: string; zip: string } {
  const trimmed = cityOrZip.trim();
  const zipMatch = trimmed.match(/\b(\d{5}(?:-\d{4})?)\b/);
  if (!zipMatch) return { city: trimmed, zip: "" };
  const zip = zipMatch[1];
  const city =
    trimmed
      .replace(zipMatch[0], "")
      .replace(/[,\s]+$/, "")
      .trim() || trimmed;
  return { city, zip };
}

function splitPreferredSchedule(
  preferredSchedule: string | null
): { preferredDays: string; preferredTimes: string } {
  if (!preferredSchedule?.trim()) {
    return { preferredDays: "", preferredTimes: "" };
  }
  const value = preferredSchedule.trim();
  const timeHint = value.match(/\b(morning|afternoon|evening|am|pm)\b/i);
  if (timeHint) {
    const times = value.match(/\b(morning|afternoon|evening|am|pm)\b/gi)?.join(", ") ?? timeHint[0];
    const days = value.replace(/\b(morning|afternoon|evening|am|pm)\b/gi, "").replace(/[,\s]+$/, "").trim();
    return { preferredDays: days || value, preferredTimes: times };
  }
  return { preferredDays: value, preferredTimes: "" };
}

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
  consent_marketing?: boolean;
  consent_waitlist?: boolean;
  created_at?: string;
}): Record<string, unknown> {
  const { city, zip } = splitCityZip(row.city_or_zip);
  const { preferredDays, preferredTimes } = splitPreferredSchedule(row.preferred_schedule);
  const consentLogged = Boolean(row.consent_marketing || row.consent_waitlist);

  return {
    "Parent First Name": row.parent_name,
    "Parent Email": row.parent_email,
    "Child Age Range": row.child_age_range,
    City: city,
    ZIP: zip,
    "Preferred Days": preferredDays,
    "Preferred Times": preferredTimes,
    "General Interest Areas": (row.interest_areas ?? []).join(", "),
    Status: mapWaitlistStatusToAirtable(row.status),
    "Consent Logged": consentLogged,
  };
}
