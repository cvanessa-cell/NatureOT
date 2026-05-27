import {
  BLOCKED_KEY_REGEX,
  BLOCKED_OUTBOUND_PAYLOAD_KEYS,
} from "@/lib/safety/blocked-fields";

/** Normalized targets aligned with enqueue labels + resolve-airtable-table-id. */
export const SUPPORTED_AIRTABLE_MAPPING_TARGETS = [
  "leads",
  "waitlist",
  "workshop registrations",
  "referral inquiries",
  "referral partners",
  "content calendar",
  "local seo pages",
  "testimonials",
] as const;

export type SupportedAirtableMappingTarget =
  (typeof SUPPORTED_AIRTABLE_MAPPING_TARGETS)[number];

/** Human label from DB → normalization key ("Leads" → "leads", "Workshops" → "workshop registrations"). */
export function normalizeAirtableTargetKey(
  label: string | null | undefined
): string | null {
  if (!label) return null;
  const t = label.trim().toLowerCase();
  if (t === "workshops") return "workshop registrations";
  return t;
}

/** True when Growth OS ships an explicit field map for the target. */
export function hasAirtableFieldMapperForTarget(
  normalizedKey: string | null
): normalizedKey is SupportedAirtableMappingTarget {
  if (!normalizedKey) return false;
  return (SUPPORTED_AIRTABLE_MAPPING_TARGETS as readonly string[]).includes(
    normalizedKey
  );
}

function isBlockedOutboundKey(key: string): boolean {
  const kl = key.toLowerCase();
  return (
    BLOCKED_OUTBOUND_PAYLOAD_KEYS.has(kl) ||
    BLOCKED_KEY_REGEX.test(key) ||
    kl.startsWith("_")
  );
}

function coerceMappedValue(raw: unknown): unknown | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === "boolean" || typeof raw === "number") return raw;
  if (typeof raw === "string") return raw;
  if (raw instanceof Date) return raw.toISOString();
  if (Array.isArray(raw)) {
    const parts = raw
      .filter((item) => item !== null && item !== undefined)
      .map((item) =>
        typeof item === "boolean" ||
        typeof item === "number" ||
        typeof item === "string"
          ? String(item)
          : null
      )
      .filter((s): s is string => typeof s === "string" && s.length > 0);
    return parts.length ? parts.join(", ") : undefined;
  }
  return undefined;
}

type InternalFieldMap = Record<string, string>;

const META_KEYS = new Set([
  "source_table",
  "source_record_id",
  "target_airtable_table",
  "_stripped_blocked_keys",
]);

const LEADS_MAP: InternalFieldMap = {
  lead_id: "Growth OS Lead ID",
  guide_lead_id: "Guide Lead ID",
  parent_email: "Email",
  email: "Email",
  parent_name: "Parent Name",
  parent_first_name: "Parent First Name",
  city: "City",
  city_or_zip: "City / ZIP",
  zip: "ZIP",
  child_age_range: "Child Age Range",
  primary_result_category: "Primary Result Category",
  general_interest_areas: "General Interest Areas",
  interest_areas: "Interest Areas",
  source: "Lead Source",
  lead_source: "Lead Source",
  guide_name: "Guide Name",
  phone: "Phone",
  parent_phone: "Phone",
  consent_marketing: "Consent Marketing",
  created_at: "Created At",
};

const WAITLIST_MAP: InternalFieldMap = {
  waitlist_entry_id: "Waitlist Entry ID",
  id: "Waitlist Entry ID",
  parent_name: "Parent Name",
  parent_email: "Email",
  parent_phone: "Phone",
  child_age_range: "Child Age Range",
  city_or_zip: "City / ZIP",
  preferred_schedule: "Preferred Schedule",
  interest_areas: "Interest Areas",
  consent_marketing: "Consent Marketing",
  consent_waitlist: "Consent Waitlist",
  status: "Status",
  created_at: "Created At",
};

const WORKSHOP_REGS_MAP: InternalFieldMap = {
  registration_id: "Registration ID",
  lead_id: "Growth OS Lead ID",
  workshop_slug: "Workshop Slug",
  workshop_title: "Workshop Title",
  parent_email: "Email",
  parent_phone: "Phone",
  city_hint: "City Hint",
  created_at: "Created At",
};

const REFERRAL_INQUIRIES_MAP: InternalFieldMap = {
  inquiry_id: "Inquiry ID",
  organization_name: "Organization Name",
  contact_name: "Contact Name",
  partner_email: "Email",
  partner_phone: "Phone",
  partner_type: "Partner Type",
  city: "City",
  created_at: "Created At",
};

const REFERRAL_PARTNERS_MAP: InternalFieldMap = {
  partner_id: "Partner ID",
  organization_name: "Organization Name",
  primary_contact_email: "Primary Email",
  primary_contact_name: "Primary Contact Name",
  partner_type: "Partner Type",
  city: "City",
  referral_code: "Referral Code",
  status: "Status",
};

const CONTENT_CALENDAR_MAP: InternalFieldMap = {
  draft_id: "Draft ID",
  title: "Title",
  channel: "Channel",
  scheduled_at: "Scheduled At",
  status: "Status",
  content_type: "Content Type",
  slug: "Slug",
};

const LOCAL_SEO_MAP: InternalFieldMap = {
  slug: "Page Slug",
  city_name: "City Name",
  state_code: "State Code",
  page_url: "Page URL",
  focus_keyword: "Focus Keyword",
  published: "Published",
};

const TESTIMONIALS_MAP: InternalFieldMap = {
  testimonial_id: "Testimonial ID",
  author_display_name: "Author Display",
  quote_excerpt: "Quote Excerpt",
  authorized: "Authorized",
  publish_status: "Publish Status",
  source: "Source",
};

const TABLE_MAPS: Record<SupportedAirtableMappingTarget, InternalFieldMap> = {
  leads: LEADS_MAP,
  waitlist: WAITLIST_MAP,
  "workshop registrations": WORKSHOP_REGS_MAP,
  "referral inquiries": REFERRAL_INQUIRIES_MAP,
  "referral partners": REFERRAL_PARTNERS_MAP,
  "content calendar": CONTENT_CALENDAR_MAP,
  "local seo pages": LOCAL_SEO_MAP,
  testimonials: TESTIMONIALS_MAP,
};

export type MapToAirtableFieldsResult =
  | {
      ok: true;
      fields: Record<string, unknown>;
      /** Internal snake_case keys with no mapping (dropped intentionally). */
      droppedKeys: string[];
    }
  | { ok: false; error: string };

/**
 * Converts internal Growth OS payload keys → Airtable field names for the normalized target label.
 * - Unknown internal keys dropped (whitelist).
 * - PHI-like keys never forwarded (blocked list + outbound regex).
 * - Never emits `_stripped_blocked_keys`.
 */
export function mapInternalPayloadToAirtableFields(
  normalizedTargetKey: string | null,
  record: Record<string, unknown>
): MapToAirtableFieldsResult {
  if (!normalizedTargetKey) {
    return {
      ok: false,
      error: "no_airtable_field_mapper_for_target: missing target label",
    };
  }
  if (!hasAirtableFieldMapperForTarget(normalizedTargetKey)) {
    return {
      ok: false,
      error: `no_airtable_field_mapper_for_target: "${normalizedTargetKey}"`,
    };
  }

  const map = TABLE_MAPS[normalizedTargetKey];
  const fields: Record<string, unknown> = {};
  const droppedKeys: string[] = [];

  for (const [internalKey, value] of Object.entries(record)) {
    if (META_KEYS.has(internalKey)) continue;
    if (internalKey === "_stripped_blocked_keys") continue;
    if (isBlockedOutboundKey(internalKey)) continue;

    const airtableField = map[internalKey];
    if (!airtableField) {
      if (!isBlockedOutboundKey(internalKey)) droppedKeys.push(internalKey);
      continue;
    }

    const coerced = coerceMappedValue(value);
    if (coerced === undefined) continue;
    fields[airtableField] = coerced;
  }

  return { ok: true, fields, droppedKeys };
}
