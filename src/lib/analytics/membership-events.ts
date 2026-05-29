"use client";

import { createMetaEventId, trackMetaEvent } from "@/lib/meta/client-events";
import type { MembershipBillingInterval } from "@/lib/membership-catalog";

export type MembershipEventName =
  | "membership_page_view"
  | "membership_monthly_click"
  | "membership_annual_click"
  | "membership_checkout_started"
  | "membership_fit_call_click";

export function trackMembershipEvent(
  eventName: MembershipEventName,
  details: { billingInterval?: MembershipBillingInterval } = {},
) {
  const eventId = createMetaEventId(eventName);
  trackMetaEvent("Lead", eventId, {
    content_name: eventName,
    content_category: "family_membership",
    billing_interval: details.billingInterval,
  });
}
