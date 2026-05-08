/**
 * Campaign authenticity policy — single source of truth for admin UI and future validation.
 * The Growth OS must never generate deceptive social proof or undisclosed synthetic personas.
 */

export const FORBIDDEN_CAMPAIGN_CREATIONS = [
  "Fake users",
  "Fake parent profiles",
  "Fake testimonials",
  "Fake reviews",
  "Fake comments",
  "Fake social media accounts",
  "Fake community advocates",
  "Bot engagement",
] as const;

export const ALLOWED_CAMPAIGN_CREATIONS = [
  "Business-owned content drafts",
  "Admin-approved social posts",
  "Email campaigns",
  "Referral partner outreach",
  "Workshop campaigns",
  "Local SEO pages",
  "Paid ad drafts",
  "Review request workflows",
  "Real testimonial authorization workflows",
  "Real ambassador/referral tracking",
  "Disclosed AI chatbot support for FAQs",
] as const;

export const PUBLIC_ATTRIBUTION_SOURCES = [
  { id: "practice", label: "The practice/business" },
  { id: "staff", label: "A real authorized staff member" },
  { id: "partner", label: "A real referral partner" },
  { id: "testimonial", label: "A real parent/client testimonial with documented authorization" },
] as const;

export type PublicAttributionSourceId = (typeof PUBLIC_ATTRIBUTION_SOURCES)[number]["id"];

export const BLOCKED_CAMPAIGN_PRACTICES = [
  "Undisclosed AI personas",
  "Fake social proof",
  "Fake engagement",
  "Review manipulation",
  "Posting from multiple artificial accounts",
  "Incentivized positive reviews",
  "Auto-published testimonials without authorization",
] as const;

export const ADMIN_APPROVAL_GATES = [
  {
    id: "social_publishing",
    label: "Social publishing",
    adminRoute: "/admin/content" as const,
  },
  {
    id: "referral_partner_outreach",
    label: "Referral partner outreach",
    adminRoute: "/admin/referral-partners" as const,
  },
  {
    id: "review_requests",
    label: "Review requests",
    adminRoute: "/admin/reviews" as const,
  },
  {
    id: "testimonial_publication",
    label: "Testimonial publication",
    adminRoute: "/admin/reviews" as const,
  },
  {
    id: "paid_ad_launch",
    label: "Paid ad launch",
    adminRoute: "/admin/content" as const,
  },
  {
    id: "public_landing_publication",
    label: "Public landing page publication",
    adminRoute: "/admin/local-seo" as const,
  },
] as const;

export type AdminApprovalGateId = (typeof ADMIN_APPROVAL_GATES)[number]["id"];

/** Short copy for compact banners on module pages. */
export const CAMPAIGN_AUTHENTICITY_SUMMARY =
  "Promotions must represent the real practice, authorized staff, verified partners, or clients with documented testimonial authorization. No fake accounts, personas, or synthetic engagement. Public posts, outreach, reviews, testimonials, ads, and landing pages require explicit admin approval before going live.";
