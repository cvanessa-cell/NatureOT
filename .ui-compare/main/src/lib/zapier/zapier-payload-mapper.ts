import {
  stripUnsafeZapierPayload,
  type StripPayloadResult,
} from "./zapier-safety-filter";

export type ZapierZapKey =
  | "new_lead"
  | "waitlist_entry"
  | "workshop_registration"
  | "booking_created"
  | "feedback_submitted"
  | "review_request"
  | "referral_followup"
  | "referral_inquiry"
  | "parent_guide_lead"
  | "content_scheduling"
  | "local_seo_build"
  | "automation_error"
  | "unsubscribe_event";

/** Lead row shape from DB or API (only fields we may forward). */
export type LeadOperationalFields = {
  id: string;
  parent_email: string;
  parent_name?: string | null;
  parent_phone?: string | null;
  child_age_range?: string | null;
  city_or_zip?: string | null;
  primary_result_category?: string | null;
  lead_source?: string | null;
  utm_campaign?: string | null;
  unsubscribed_at?: string | null;
  consent_marketing?: boolean | null;
};

export type WaitlistOperationalFields = {
  id: string;
  parent_name: string;
  parent_email: string;
  parent_phone?: string | null;
  child_age_range: string;
  city_or_zip: string;
  preferred_schedule?: string | null;
  interest_areas?: string[] | null;
  consent_marketing: boolean;
  consent_waitlist: boolean;
};

export type WorkshopRegistrationFields = {
  id: string;
  workshop_id?: string | null;
  workshop_slug?: string | null;
  workshop_title?: string | null;
  parent_name: string;
  parent_email: string;
  parent_phone?: string | null;
  child_age_range?: string | null;
  status: string;
  lead_id?: string | null;
};

export type BookingOperationalFields = {
  lead_id: string;
  provider: string;
  external_id?: string | null;
  status?: string | null;
  lead_email?: string | null;
};

export type FeedbackOperationalFields = {
  id?: string | null;
  lead_id?: string | null;
  workshop_id?: string | null;
  rating?: number | null;
  /** Intentionally omitted from Zapier unless admin-approved review path (no free text). */
};

export type ContentPostSchedulingFields = {
  id: string;
  title: string;
  channel?: string | null;
  status: string;
  scheduled_for?: string | null;
};

export type LocalSeoPageFields = {
  id: string;
  slug: string;
  city: string;
  state: string;
  title: string;
  status: string;
};

export type TestimonialOperationalFields = {
  id: string;
  quote: string;
  status: string;
  authorization_id?: string | null;
  publish_allowed: boolean;
};

export type ReferralPartnerFollowUpFields = {
  id: string;
  name: string;
  email?: string | null;
  next_follow_up?: string | null;
};

function applyStrip(
  payload: Record<string, unknown>
): StripPayloadResult & { data: Record<string, unknown> } {
  return stripUnsafeZapierPayload(payload);
}

export function mapLeadCreatedPayload(lead: LeadOperationalFields) {
  const base: Record<string, unknown> = {
    event: "lead_created",
    lead_id: lead.id,
    parent_email: lead.parent_email,
    parent_name: lead.parent_name ?? undefined,
    parent_phone: lead.parent_phone ?? undefined,
    child_age_range: lead.child_age_range ?? undefined,
    city_or_zip: lead.city_or_zip ?? undefined,
    primary_result_category: lead.primary_result_category ?? undefined,
    lead_source: lead.lead_source ?? undefined,
    utm_campaign: lead.utm_campaign ?? undefined,
    consent_marketing: lead.consent_marketing ?? undefined,
  };
  return applyStrip(base);
}

export function mapWaitlistCreatedPayload(entry: WaitlistOperationalFields) {
  const base: Record<string, unknown> = {
    event: "waitlist_created",
    waitlist_id: entry.id,
    parent_name: entry.parent_name,
    parent_email: entry.parent_email,
    parent_phone: entry.parent_phone ?? undefined,
    child_age_range: entry.child_age_range,
    city_or_zip: entry.city_or_zip,
    preferred_schedule: entry.preferred_schedule ?? undefined,
    interest_areas: entry.interest_areas ?? [],
    consent_marketing: entry.consent_marketing,
    consent_waitlist: entry.consent_waitlist,
  };
  return applyStrip(base);
}

export function mapWorkshopRegistrationPayload(row: WorkshopRegistrationFields) {
  const base: Record<string, unknown> = {
    event: "workshop_registration",
    registration_id: row.id,
    workshop_id: row.workshop_id ?? undefined,
    workshop_slug: row.workshop_slug ?? undefined,
    workshop_title: row.workshop_title ?? undefined,
    parent_name: row.parent_name,
    parent_email: row.parent_email,
    parent_phone: row.parent_phone ?? undefined,
    child_age_range: row.child_age_range ?? undefined,
    status: row.status,
    lead_id: row.lead_id ?? undefined,
  };
  return applyStrip(base);
}

export type ReferralInquiryOperationalFields = {
  id: string;
  organization_name: string;
  contact_name: string;
  email: string;
  phone?: string | null;
  partner_type?: string | null;
  city?: string | null;
};

export function mapReferralInquiryPayload(row: ReferralInquiryOperationalFields) {
  const base: Record<string, unknown> = {
    event: "referral_inquiry_created",
    inquiry_id: row.id,
    organization_name: row.organization_name,
    contact_name: row.contact_name,
    partner_email: row.email,
    partner_phone: row.phone ?? undefined,
    partner_type: row.partner_type ?? undefined,
    city: row.city ?? undefined,
  };
  return applyStrip(base);
}

export type ParentGuideLeadOperationalFields = {
  guide_lead_id: string;
  lead_id?: string | null;
  parent_email: string;
  parent_first_name?: string | null;
  city?: string | null;
  guide_name?: string | null;
};

export function mapParentGuideLeadPayload(row: ParentGuideLeadOperationalFields) {
  const base: Record<string, unknown> = {
    event: "parent_guide_lead_created",
    guide_lead_id: row.guide_lead_id,
    lead_id: row.lead_id ?? undefined,
    parent_email: row.parent_email,
    parent_first_name: row.parent_first_name ?? undefined,
    city: row.city ?? undefined,
    guide_name: row.guide_name ?? undefined,
  };
  return applyStrip(base);
}

export function mapBookingCreatedPayload(booking: BookingOperationalFields) {
  const base: Record<string, unknown> = {
    event: "booking_created",
    lead_id: booking.lead_id,
    provider: booking.provider,
    external_id: booking.external_id ?? undefined,
    status: booking.status ?? "scheduled",
    lead_email: booking.lead_email ?? undefined,
  };
  return applyStrip(base);
}

export function mapFeedbackSubmittedPayload(feedback: FeedbackOperationalFields) {
  const base: Record<string, unknown> = {
    event: "feedback_submitted",
    feedback_id: feedback.id ?? undefined,
    lead_id: feedback.lead_id ?? undefined,
    workshop_id: feedback.workshop_id ?? undefined,
    rating: feedback.rating ?? undefined,
  };
  return applyStrip(base);
}

export function mapReviewRequestPayload(fields: {
  lead_email: string;
  parent_name?: string | null;
  rating: number;
}) {
  const base: Record<string, unknown> = {
    event: "review_request",
    lead_email: fields.lead_email,
    parent_name: fields.parent_name ?? undefined,
    rating: fields.rating,
  };
  return applyStrip(base);
}

export function mapReferralFollowUpDuePayload(partner: ReferralPartnerFollowUpFields) {
  const base: Record<string, unknown> = {
    event: "referral_partner_follow_up_due",
    referral_partner_id: partner.id,
    name: partner.name,
    email: partner.email ?? undefined,
    next_follow_up: partner.next_follow_up ?? undefined,
  };
  return applyStrip(base);
}

/** Only export scheduling metadata when editorial status is Approved. */
export function mapContentSchedulingPayload(
  post: ContentPostSchedulingFields
):
  | ({ ok: true } & StripPayloadResult)
  | { ok: false; reason: string } {
  if (post.status !== "approved") {
    return {
      ok: false,
      reason: "Content must be approved before any scheduling Zapier relay.",
    };
  }
  const base: Record<string, unknown> = {
    event: "content_calendar_approved",
    content_post_id: post.id,
    title: post.title,
    channel: post.channel ?? undefined,
    status: post.status,
    scheduled_for: post.scheduled_for ?? undefined,
  };
  return { ok: true, ...applyStrip(base) };
}

export function mapLocalSeoApprovedPayload(page: LocalSeoPageFields):
  | ({ ok: true } & StripPayloadResult)
  | { ok: false; reason: string } {
  if (page.status !== "approved") {
    return {
      ok: false,
      reason: "Local SEO page must be approved before build-task webhooks.",
    };
  }
  const base: Record<string, unknown> = {
    event: "local_seo_approved",
    landing_page_id: page.id,
    slug: page.slug,
    city: page.city,
    state: page.state,
    title: page.title,
    status: page.status,
  };
  return { ok: true, ...applyStrip(base) };
}

/**
 * Testimonial / public quote content must never leave without authorization + publish flags.
 */
export function mapTestimonialOutboundPayload(
  t: TestimonialOperationalFields
):
  | ({ ok: true } & StripPayloadResult)
  | { ok: false; reason: string } {
  if (!t.authorization_id) {
    return { ok: false, reason: "Missing testimonial authorization id" };
  }
  if (!t.publish_allowed) {
    return { ok: false, reason: "Testimonial not marked publish_allowed" };
  }
  const base: Record<string, unknown> = {
    event: "testimonial_authorized",
    testimonial_id: t.id,
    status: t.status,
    authorization_id: t.authorization_id,
    display_preview: (t.quote ?? "").slice(0, 120),
  };
  return { ok: true, ...applyStrip(base) };
}

export function mapUnsubscribePayload(fields: {
  lead_id: string;
  email?: string | null;
}) {
  const base: Record<string, unknown> = {
    event: "unsubscribe",
    lead_id: fields.lead_id,
    email: fields.email ?? undefined,
  };
  return applyStrip(base);
}

export function mapAutomationErrorPayload(fields: {
  message: string;
  zap_name?: string;
  context?: Record<string, unknown>;
}) {
  const base: Record<string, unknown> = {
    event: "automation_error",
    message: fields.message,
    zap_name: fields.zap_name ?? undefined,
    context: fields.context ?? {},
  };
  return applyStrip(base);
}
