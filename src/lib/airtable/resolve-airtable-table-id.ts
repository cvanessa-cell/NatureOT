import { getEnv } from "@/lib/env";

/** Map human-readable target labels from enqueue to env-configured table IDs. */
export function resolveAirtableTableIdForTarget(
  targetLabel: string | null | undefined
): string | undefined {
  if (!targetLabel) return undefined;
  const env = getEnv();
  const key = targetLabel.trim().toLowerCase();

  const map: Record<string, string | undefined> = {
    leads: env.AIRTABLE_LEADS_TABLE_ID,
    "workshop registrations": env.AIRTABLE_WORKSHOP_REGISTRATIONS_TABLE_ID,
    workshops: env.AIRTABLE_WORKSHOPS_TABLE_ID,
    "referral inquiries": env.AIRTABLE_REFERRAL_INQUIRIES_TABLE_ID,
    "referral partners": env.AIRTABLE_REFERRAL_PARTNERS_TABLE_ID,
    waitlist: env.AIRTABLE_WAITLIST_TABLE_ID,
    "content calendar": env.AIRTABLE_CONTENT_CALENDAR_TABLE_ID,
    "local seo pages": env.AIRTABLE_LOCAL_SEO_PAGES_TABLE_ID,
    testimonials: env.AIRTABLE_TESTIMONIALS_TABLE_ID,
  };

  return map[key];
}
