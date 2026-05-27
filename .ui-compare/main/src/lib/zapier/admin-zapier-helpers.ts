import { getEnv } from "@/lib/env";
import {
  BLOCKED_FIELDS_DOC,
  isBlockedZapierKey,
} from "./zapier-safety-filter";
import type { ZapierZapKey } from "./zapier-payload-mapper";
import {
  mapAutomationErrorPayload,
  mapBookingCreatedPayload,
  mapContentSchedulingPayload,
  mapFeedbackSubmittedPayload,
  mapLeadCreatedPayload,
  mapLocalSeoApprovedPayload,
  mapReferralFollowUpDuePayload,
  mapReviewRequestPayload,
  mapUnsubscribePayload,
  mapWaitlistCreatedPayload,
  mapWorkshopRegistrationPayload,
} from "./zapier-payload-mapper";

export function zapiersEnvSnapshot() {
  const e = getEnv();
  const mask = (s: string | undefined) =>
    s ? `${String(s).slice(0, 6)}…masked` : "(unset)";
  return {
    ZAPIER_ENABLED: e.ZAPIER_ENABLED ?? "(unset)",
    ZAPIER_DRY_RUN: e.ZAPIER_DRY_RUN ?? "(unset)",
    ZAPIER_WEBHOOK_SECRET: mask(e.ZAPIER_WEBHOOK_SECRET),
    ZAPIER_NEW_LEAD_WEBHOOK_URL:
      e.ZAPIER_NEW_LEAD_WEBHOOK_URL ?? "(unset)",
    ZAPIER_WAITLIST_WEBHOOK_URL:
      e.ZAPIER_WAITLIST_WEBHOOK_URL ?? "(unset)",
    ZAPIER_WORKSHOP_WEBHOOK_URL:
      e.ZAPIER_WORKSHOP_WEBHOOK_URL ?? "(unset)",
    ZAPIER_BOOKING_WEBHOOK_URL:
      e.ZAPIER_BOOKING_WEBHOOK_URL ?? "(unset)",
    ZAPIER_FEEDBACK_WEBHOOK_URL:
      e.ZAPIER_FEEDBACK_WEBHOOK_URL ?? "(unset)",
    ZAPIER_UNSUBSCRIBE_WEBHOOK_URL:
      e.ZAPIER_UNSUBSCRIBE_WEBHOOK_URL ?? "(unset)",
    ZAPIER_ERROR_WEBHOOK_URL: e.ZAPIER_ERROR_WEBHOOK_URL ?? "(unset)",
    ZAPIER_REFERRAL_WEBHOOK_URL:
      e.ZAPIER_REFERRAL_WEBHOOK_URL ?? "(unset)",
    ZAPIER_CONTENT_WEBHOOK_URL:
      e.ZAPIER_CONTENT_WEBHOOK_URL ?? "(unset)",
    ZAPIER_SEO_WEBHOOK_URL: e.ZAPIER_SEO_WEBHOOK_URL ?? "(unset)",
  };
}

export function blockedFieldsClassificationDoc() {
  return {
    subtitle:
      "Operational denylist strips clinical / PHI‑like keys before payloads reach Zapier.",
    rules: BLOCKED_FIELDS_DOC,
    sampleChecks: ["child_full_dob", "main_concern", "clinical_notes"].map(
      (k) => ({
        field: k,
        blocked: isBlockedZapierKey(k),
      })
    ),
  };
}

/** Deterministic payloads for privileged dry-run previews. */
export type DryRunPreview = {
  fixtureLabel: string;
  zapKey: ZapierZapKey;
  payload: Record<string, unknown>;
  containsParentChildData: boolean;
  phiRiskLevel: "none" | "low" | "medium" | "high";
  approvalRequired: boolean;
};

export function buildDryRunOutboundPreview(
  body: Record<string, unknown>
): DryRunPreview {
  const zapKey = String(body.zapKey ?? "") as ZapierZapKey;

  switch (zapKey) {
    case "new_lead": {
      const m = mapLeadCreatedPayload({
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        parent_email: "parent@example.com",
        parent_name: "Taylor Parent",
        child_age_range: "4–6 yrs",
        city_or_zip: "78701",
        primary_result_category: "sensory_regulation",
      });
      return {
        fixtureLabel: "new_lead",
        zapKey,
        payload: m.data,
        containsParentChildData: true,
        phiRiskLevel: m.phiRiskSuggestion,
        approvalRequired: false,
      };
    }
    case "waitlist_entry": {
      const m = mapWaitlistCreatedPayload({
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        parent_name: "Jordan Parent",
        parent_email: "waitlist@example.com",
        child_age_range: "3–4 yrs",
        city_or_zip: "78705",
        preferred_schedule: "Weekday mornings",
        interest_areas: ["group", "nature OT"],
        consent_marketing: true,
        consent_waitlist: true,
      });
      return {
        fixtureLabel: "waitlist_entry",
        zapKey,
        payload: m.data,
        containsParentChildData: true,
        phiRiskLevel: m.phiRiskSuggestion,
        approvalRequired: false,
      };
    }
    case "workshop_registration": {
      const m = mapWorkshopRegistrationPayload({
        id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        workshop_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        parent_name: "Alex Parent",
        parent_email: "workshop@example.com",
        child_age_range: "5 yrs",
        status: "registered",
      });
      return {
        fixtureLabel: "workshop_registration",
        zapKey,
        payload: m.data,
        containsParentChildData: true,
        phiRiskLevel: m.phiRiskSuggestion,
        approvalRequired: false,
      };
    }
    case "booking_created": {
      const m = mapBookingCreatedPayload({
        lead_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        provider: "calcom",
        status: "scheduled",
        external_id: "ext-123",
        lead_email: "parent@example.com",
      });
      return {
        fixtureLabel: "booking_created",
        zapKey,
        payload: m.data,
        containsParentChildData: true,
        phiRiskLevel: m.phiRiskSuggestion,
        approvalRequired: false,
      };
    }
    case "feedback_submitted": {
      const m = mapFeedbackSubmittedPayload({
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        rating: 5,
      });
      return {
        fixtureLabel: "feedback_submitted",
        zapKey,
        payload: m.data,
        containsParentChildData: false,
        phiRiskLevel: m.phiRiskSuggestion,
        approvalRequired: true,
      };
    }
    case "review_request": {
      const m = mapReviewRequestPayload({
        lead_email: "review@example.com",
        rating: 5,
        parent_name: "Sam Parent",
      });
      return {
        fixtureLabel: "review_request",
        zapKey,
        payload: m.data,
        containsParentChildData: true,
        phiRiskLevel: m.phiRiskSuggestion,
        approvalRequired: true,
      };
    }
    case "referral_followup": {
      const m = mapReferralFollowUpDuePayload({
        id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
        name: "Sunrise Pediatrics",
        email: "outreach@example.com",
      });
      return {
        fixtureLabel: "referral_followup",
        zapKey,
        payload: m.data,
        containsParentChildData: false,
        phiRiskLevel: m.phiRiskSuggestion,
        approvalRequired: true,
      };
    }
    case "content_scheduling": {
      const m = mapContentSchedulingPayload({
        id: "10101010-1010-1010-1010-101010101010",
        title: "Weekly outdoor OT tip",
        channel: "instagram",
        status: "approved",
        scheduled_for: new Date(Date.now() + 86400000).toISOString(),
      });
      if (!m.ok) throw new Error(m.reason);
      return {
        fixtureLabel: "content_scheduling_approved",
        zapKey,
        payload: m.data,
        containsParentChildData: false,
        phiRiskLevel: m.phiRiskSuggestion,
        approvalRequired: true,
      };
    }
    case "local_seo_build": {
      const m = mapLocalSeoApprovedPayload({
        id: "20202020-2020-2020-2020-202020202020",
        slug: "austin-outdoor-sensory",
        city: "Austin",
        state: "TX",
        title: "Outdoor sensory play in Austin",
        status: "approved",
      });
      if (!m.ok) throw new Error(m.reason);
      return {
        fixtureLabel: "local_seo_approved",
        zapKey,
        payload: m.data,
        containsParentChildData: false,
        phiRiskLevel: m.phiRiskSuggestion,
        approvalRequired: true,
      };
    }
    case "automation_error": {
      const m = mapAutomationErrorPayload({
        message: "Zap step failed smoke test",
        zap_name: "Dry run",
      });
      return {
        fixtureLabel: "automation_error",
        zapKey,
        payload: m.data,
        containsParentChildData: false,
        phiRiskLevel: "none",
        approvalRequired: false,
      };
    }
    case "unsubscribe_event": {
      const m = mapUnsubscribePayload({
        lead_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        email: "unsubscribed@example.com",
      });
      return {
        fixtureLabel: "unsubscribe_event",
        zapKey,
        payload: m.data,
        containsParentChildData: true,
        phiRiskLevel: m.phiRiskSuggestion,
        approvalRequired: false,
      };
    }
    default:
      throw new Error(`Unsupported zapKey: ${body.zapKey}`);
  }
}
