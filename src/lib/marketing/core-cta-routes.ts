/**
 * Core revenue / intake routes exercised in launch-readiness manual QA and e2e smoke.
 */
export type CoreCtaRoute = {
  id: string;
  path: string;
  title: string;
  /** Substrings expected in rendered HTML (server or client shell). */
  markers: string[];
};

export const CORE_CTA_MANUAL_QA_PAGES: CoreCtaRoute[] = [
  {
    id: "home",
    path: "/",
    title: "Homepage",
    markers: [
      'href="/waitlist"',
      'href="/book-call"',
      'href="/provider-referral"',
      "Join the Waitlist",
      "Book a Free Parent Call",
      "Start a Provider Referral",
      "Join Waitlist",
      "Book Call",
    ],
  },
  {
    id: "bookCall",
    path: "/book-call",
    title: "Book a parent call",
    markers: [
      "Book a Parent Call",
      'id="schedule"',
      "Choose a time that works for your family",
      'href="/waitlist"',
    ],
  },
  {
    id: "waitlist",
    path: "/waitlist",
    title: "Waitlist form",
    markers: [
      "Join the TreeTots DFW interest list",
      'id="waitlist-form"',
      'href="/book-call"',
      "Start the form",
    ],
  },
  {
    id: "providerReferral",
    path: "/provider-referral",
    title: "Provider referral",
    markers: [
      "Refer a family with a clear, privacy-aware next step",
      'id="provider-form"',
      "Start Referral Request",
      'href="/book-call"',
    ],
  },
];

/** Pages tracked in launch-readiness beyond core CTAs. */
export const LAUNCH_CONTENT_MANUAL_QA_PAGES: { id: string; path: string; title: string }[] = [
  { id: "groups", path: "/groups", title: "Groups page" },
  { id: "guidePage", path: "/parent-guide", title: "Parent guide marketing page" },
  { id: "workshops", path: "/workshops", title: "Workshops page" },
  { id: "referrals", path: "/referral-partners", title: "Referral partners page" },
];
