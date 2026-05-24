import type { CheckoutSlug } from "@/lib/services-catalog";

const DEFAULT_SUCCESS_STEPS = [
  "Watch for a confirmation email with scheduling details.",
  "Questions before your first session? Book a parent fit call from our site.",
] as const;

const SUCCESS_STEPS: Partial<Record<CheckoutSlug, readonly string[]>> = {
  "nature-play-dropin": [
    "We'll email session date, location, and what to bring for outdoor play.",
    "Dress for weather and movement—closed-toe shoes recommended.",
  ],
  "nature-play-pass": [
    "We'll email your pass details and upcoming session dates.",
    "Your six sessions can be scheduled as openings become available.",
  ],
  "ot-group": [
    "We'll confirm group fit and share your first outdoor session details.",
    "Expect a brief caregiver check-in before the first group meeting.",
  ],
  "ot-group-series": [
    "We'll confirm group fit and your six-week schedule.",
    "Caregiver updates may be shared depending on program structure.",
  ],
  reflex: [
    "We'll send virtual onboarding and daily exercise access instructions.",
    "Plan for about 30 minutes of guided home practice each day for four weeks.",
  ],
};

export function checkoutSuccessNextSteps(slug: string | null): readonly string[] {
  if (!slug) return DEFAULT_SUCCESS_STEPS;
  return SUCCESS_STEPS[slug as CheckoutSlug] ?? DEFAULT_SUCCESS_STEPS;
}
