export type MembershipBillingInterval = "monthly" | "annual";

export type MembershipCheckoutOption = {
  billingInterval: MembershipBillingInterval;
  checkoutSlug: string;
  name: string;
  amount: number;
  priceLabel: string;
  priceId: string | undefined;
  priceEnvKey: string;
  savingsLabel?: string;
};

export const MEMBERSHIP_PRICE_ENV: Record<MembershipBillingInterval, string> = {
  monthly: "STRIPE_TREETOTS_MEMBERSHIP_MONTHLY_PRICE_ID",
  annual: "STRIPE_TREETOTS_MEMBERSHIP_ANNUAL_PRICE_ID",
};

export const MEMBERSHIP_PLAN = {
  name: "TreeTots Family Membership",
  shortName: "Family Membership",
  description:
    "A simple membership for families who want ongoing connection, caregiver resources, priority access to TreeTots programs, nature play opportunities, and early access to seasonal groups and workshops.",
  monthlyAmount: 49,
  annualAmount: 499,
  annualSavings: 89,
  ctaLabels: {
    monthly: "Join Monthly",
    annual: "Join Annually",
    fitCall: "Ask If Membership Is a Good Fit",
  },
} as const;

export const MEMBERSHIP_BENEFITS = [
  "Priority access to upcoming Nature-Based OT Groups",
  "Early access to seasonal groups, workshops, and camps",
  "Monthly caregiver nature-play or regulation activity guide",
  "Member-only nature play and community meetup opportunities when available",
  "Discounted drop-in nature play or group add-ons when available",
  "Sibling-friendly member perks when available",
  "Waitlist priority",
] as const;

export const MEMBERSHIP_WHO_ITS_FOR = [
  "Families interested in future Nature-Based OT Groups",
  "Families who want ongoing nature-based ideas at home",
  "Families who want early access to seasonal programming",
  "Families who are not ready for a full group series yet but want to stay connected",
] as const;

export const MEMBERSHIP_DISCLAIMERS = [
  "Membership does not replace individualized occupational therapy.",
  "Membership does not guarantee group placement, clinical outcomes, or availability.",
  "Therapy recommendations require appropriate intake or evaluation and clinical judgment.",
  "Membership is a community and priority-access layer, not unlimited OT care.",
] as const;

export const MEMBERSHIP_FAQ = [
  {
    id: "is-this-ot",
    q: "Is this occupational therapy?",
    a: "No. The membership is a community, caregiver resource, and priority-access offer. Individualized occupational therapy requires appropriate intake, evaluation, and clinical judgment.",
  },
  {
    id: "guarantee-group-spot",
    q: "Does membership guarantee a group spot?",
    a: "No. Members receive priority access and early notice, but placement still depends on availability, age range, group fit, and safety.",
  },
  {
    id: "can-i-cancel",
    q: "Can I cancel?",
    a: "Yes. Membership is billed monthly or annually through Stripe. You can reach out if you need help with cancellation or billing questions.",
  },
  {
    id: "book-parent-call",
    q: "Can I still book a parent fit call?",
    a: "Yes. A parent fit call is still the best next step when you want help deciding whether membership, a group, or another TreeTots option may fit your family.",
  },
  {
    id: "right-for-child",
    q: "Is this right for my child?",
    a: "It may be a good fit if your family wants ongoing connection, nature-based ideas, and early access to programming. It is not a substitute for individualized therapy recommendations.",
  },
] as const;

const CHECKOUT_SLUGS: Record<MembershipBillingInterval, string> = {
  monthly: "family-membership-monthly",
  annual: "family-membership-annual",
};

export function isMembershipBillingInterval(
  value: string,
): value is MembershipBillingInterval {
  return value === "monthly" || value === "annual";
}

export function getMembershipCheckoutOption(
  billingInterval: MembershipBillingInterval,
): MembershipCheckoutOption {
  const priceEnvKey = MEMBERSHIP_PRICE_ENV[billingInterval];
  const isAnnual = billingInterval === "annual";

  return {
    billingInterval,
    checkoutSlug: CHECKOUT_SLUGS[billingInterval],
    name: `${MEMBERSHIP_PLAN.name} (${isAnnual ? "Annual" : "Monthly"})`,
    amount: isAnnual ? MEMBERSHIP_PLAN.annualAmount : MEMBERSHIP_PLAN.monthlyAmount,
    priceLabel: isAnnual ? "$499/year" : "$49/month",
    priceId: process.env[priceEnvKey]?.trim() || undefined,
    priceEnvKey,
    savingsLabel: isAnnual ? `Save $${MEMBERSHIP_PLAN.annualSavings}/year` : undefined,
  };
}

export function isMembershipPriceConfigured(
  billingInterval: MembershipBillingInterval,
): boolean {
  return Boolean(getMembershipCheckoutOption(billingInterval).priceId);
}
