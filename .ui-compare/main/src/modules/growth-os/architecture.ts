/**
 * Nature OT Growth OS — module map (Supabase = source of truth; Airtable = ops mirror).
 *
 * MVP wired: waitlist (public + admin), Airtable sync (push/pull preview), Agent command previews.
 * Planned: enrollment manager, workshops, referral CRM UI, content calendar, SEO generator,
 * testimonials workflow, analytics, compliance settings.
 */

export const MODULES = [
  "lead_quiz",
  "waitlist",
  "group_enrollment",
  "workshops",
  "referral_crm",
  "email_automation",
  "social_planner",
  "reviews",
  "local_seo",
  "analytics",
  "compliance",
  "airtable_sync",
  "agent_airtable",
] as const;
