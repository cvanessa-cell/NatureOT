import { z } from "zod";

/** Prefer NEXT_PUBLIC_* for browser; fall back to server-only SUPABASE_* per deployment docs. */
export function getSupabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    undefined
  );
}

export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    undefined
  );
}

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  /** When "true", Resend sends are skipped; email_events still recorded as dry_run. */
  EMAIL_DRY_RUN: z.string().optional(),
  NEXT_PUBLIC_BOOKING_EMBED_URL: z.string().url().optional(),
  CRON_SECRET: z.string().optional(),
  RESEND_WEBHOOK_SECRET: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
  /** Airtable: PAT lives server-side only — never NEXT_PUBLIC_. */
  AIRTABLE_API_KEY: z.string().optional(),
  AIRTABLE_BASE_ID: z.string().optional(),
  AIRTABLE_SYNC_ENABLED: z.string().optional(),
  AIRTABLE_DRY_RUN: z.string().optional(),
  AIRTABLE_LEADS_TABLE_ID: z.string().optional(),
  AIRTABLE_WORKSHOP_REGISTRATIONS_TABLE_ID: z.string().optional(),
  AIRTABLE_REFERRAL_INQUIRIES_TABLE_ID: z.string().optional(),
  AIRTABLE_REFERRAL_PARTNERS_TABLE_ID: z.string().optional(),
  AIRTABLE_WAITLIST_TABLE_ID: z.string().optional(),
  AIRTABLE_WORKSHOPS_TABLE_ID: z.string().optional(),
  /** Alias for LOCAL_SEO in ops docs; falls back to AIRTABLE_SEO_PAGES_TABLE_ID. */
  AIRTABLE_LOCAL_SEO_PAGES_TABLE_ID: z.string().optional(),
  AIRTABLE_CONTENT_CALENDAR_TABLE_ID: z.string().optional(),
  AIRTABLE_SEO_PAGES_TABLE_ID: z.string().optional(),
  AIRTABLE_TESTIMONIALS_TABLE_ID: z.string().optional(),
  AGENT_AIRTABLE_ENABLED: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_DROPIN: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_6_PASS: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_SINGLE: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_6_WEEK: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_REFLEX_INTENSIVE: z.string().optional(),
  STRIPE_TREETOTS_MEMBERSHIP_MONTHLY_PRICE_ID: z.string().optional(),
  STRIPE_TREETOTS_MEMBERSHIP_ANNUAL_PRICE_ID: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
  META_ACCESS_TOKEN: z.string().optional(),
  META_TEST_EVENT_CODE: z.string().optional(),
  META_CAPI_ENABLED: z.string().optional(),
  META_CAPI_DRY_RUN: z.string().optional(),
  ZAPIER_ENABLED: z.string().optional(),
  ZAPIER_DRY_RUN: z.string().optional(),
  ZAPIER_WEBHOOK_SECRET: z.string().optional(),
  ZAPIER_NEW_LEAD_WEBHOOK_URL: z.string().url().optional(),
  /** Slack Incoming Webhook — server-only; channel is set in Slack app config. */
  SLACK_ENABLED: z.string().optional(),
  SLACK_DRY_RUN: z.string().optional(),
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  ZAPIER_WAITLIST_WEBHOOK_URL: z.string().url().optional(),
  ZAPIER_WORKSHOP_WEBHOOK_URL: z.string().url().optional(),
  ZAPIER_BOOKING_WEBHOOK_URL: z.string().url().optional(),
  ZAPIER_FEEDBACK_WEBHOOK_URL: z.string().url().optional(),
  ZAPIER_UNSUBSCRIBE_WEBHOOK_URL: z.string().url().optional(),
  ZAPIER_ERROR_WEBHOOK_URL: z.string().url().optional(),
  ZAPIER_REFERRAL_WEBHOOK_URL: z.string().url().optional(),
  ZAPIER_CONTENT_WEBHOOK_URL: z.string().url().optional(),
  ZAPIER_SEO_WEBHOOK_URL: z.string().url().optional(),
  /** Public-facing booking page or embed permalink (marketing CTAs). */
  NEXT_PUBLIC_BOOKING_URL: z.string().url().optional(),
  /** Optional absolute URL for CDN-hosted PDF; delivery mode selects behavior. */
  PARENT_GUIDE_ASSET_URL: z.string().url().optional(),
  /** Path on this site (default `/guides/outdoor-sensory-activities-texas-kids.html`). */
  PARENT_GUIDE_PUBLIC_ASSET_PATH: z.string().optional(),
  /** public_asset uses Growth OS-hosted guide; signed_url_future prefers PARENT_GUIDE_ASSET_URL later. */
  PARENT_GUIDE_DELIVERY_MODE: z.string().optional(),
  PARENT_GUIDE_STORAGE_BUCKET: z.string().optional(),
  PARENT_GUIDE_STORAGE_PATH: z.string().optional(),
  PARENT_GUIDE_SIGNED_URL_EXPIRES_SECONDS: z.string().optional(),
  /** Max rows each Airtable sync cron invocation may dequeue. */
  AIRTABLE_CRON_PROCESS_LIMIT: z.string().optional(),
  /** Parallel Airtable sync workers per batch (1–25); admin API can override. */
  AIRTABLE_SYNC_CONCURRENCY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/** Treat blank .env values as unset so optional URL fields do not fail Zod. */
function envOpt(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v ? v : undefined;
}

export function getEnv(): Env {
  return envSchema.parse({
    NEXT_PUBLIC_APP_URL: envOpt("NEXT_PUBLIC_APP_URL"),
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_DRY_RUN: process.env.EMAIL_DRY_RUN,
    NEXT_PUBLIC_BOOKING_EMBED_URL: envOpt("NEXT_PUBLIC_BOOKING_EMBED_URL"),
    CRON_SECRET: process.env.CRON_SECRET,
    RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    AIRTABLE_SYNC_ENABLED: process.env.AIRTABLE_SYNC_ENABLED,
    AIRTABLE_DRY_RUN: process.env.AIRTABLE_DRY_RUN,
    AIRTABLE_LEADS_TABLE_ID: process.env.AIRTABLE_LEADS_TABLE_ID,
    AIRTABLE_WORKSHOP_REGISTRATIONS_TABLE_ID:
      process.env.AIRTABLE_WORKSHOP_REGISTRATIONS_TABLE_ID,
    AIRTABLE_REFERRAL_INQUIRIES_TABLE_ID:
      process.env.AIRTABLE_REFERRAL_INQUIRIES_TABLE_ID,
    AIRTABLE_REFERRAL_PARTNERS_TABLE_ID:
      process.env.AIRTABLE_REFERRAL_PARTNERS_TABLE_ID,
    AIRTABLE_WAITLIST_TABLE_ID: process.env.AIRTABLE_WAITLIST_TABLE_ID,
    AIRTABLE_WORKSHOPS_TABLE_ID: process.env.AIRTABLE_WORKSHOPS_TABLE_ID,
    AIRTABLE_LOCAL_SEO_PAGES_TABLE_ID:
      process.env.AIRTABLE_LOCAL_SEO_PAGES_TABLE_ID ??
      process.env.AIRTABLE_SEO_PAGES_TABLE_ID,
    AIRTABLE_CONTENT_CALENDAR_TABLE_ID:
      process.env.AIRTABLE_CONTENT_CALENDAR_TABLE_ID,
    AIRTABLE_SEO_PAGES_TABLE_ID: process.env.AIRTABLE_SEO_PAGES_TABLE_ID,
    AIRTABLE_TESTIMONIALS_TABLE_ID: process.env.AIRTABLE_TESTIMONIALS_TABLE_ID,
    AGENT_AIRTABLE_ENABLED: process.env.AGENT_AIRTABLE_ENABLED,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_DROPIN:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_DROPIN,
    NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_6_PASS:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_6_PASS,
    NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_SINGLE:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_SINGLE,
    NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_6_WEEK:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_6_WEEK,
    NEXT_PUBLIC_STRIPE_PRICE_REFLEX_INTENSIVE:
      process.env.NEXT_PUBLIC_STRIPE_PRICE_REFLEX_INTENSIVE,
    STRIPE_TREETOTS_MEMBERSHIP_MONTHLY_PRICE_ID:
      process.env.STRIPE_TREETOTS_MEMBERSHIP_MONTHLY_PRICE_ID,
    STRIPE_TREETOTS_MEMBERSHIP_ANNUAL_PRICE_ID:
      process.env.STRIPE_TREETOTS_MEMBERSHIP_ANNUAL_PRICE_ID,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: envOpt("OPENAI_BASE_URL"),
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
    META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN,
    META_TEST_EVENT_CODE: process.env.META_TEST_EVENT_CODE,
    META_CAPI_ENABLED: process.env.META_CAPI_ENABLED,
    META_CAPI_DRY_RUN: process.env.META_CAPI_DRY_RUN,
    ZAPIER_ENABLED: process.env.ZAPIER_ENABLED,
    ZAPIER_DRY_RUN: process.env.ZAPIER_DRY_RUN,
    ZAPIER_WEBHOOK_SECRET: process.env.ZAPIER_WEBHOOK_SECRET,
    ZAPIER_NEW_LEAD_WEBHOOK_URL: envOpt("ZAPIER_NEW_LEAD_WEBHOOK_URL"),
    SLACK_ENABLED: process.env.SLACK_ENABLED,
    SLACK_DRY_RUN: process.env.SLACK_DRY_RUN,
    SLACK_WEBHOOK_URL: envOpt("SLACK_WEBHOOK_URL"),
    ZAPIER_WAITLIST_WEBHOOK_URL: envOpt("ZAPIER_WAITLIST_WEBHOOK_URL"),
    ZAPIER_WORKSHOP_WEBHOOK_URL: envOpt("ZAPIER_WORKSHOP_WEBHOOK_URL"),
    ZAPIER_BOOKING_WEBHOOK_URL: envOpt("ZAPIER_BOOKING_WEBHOOK_URL"),
    ZAPIER_FEEDBACK_WEBHOOK_URL: envOpt("ZAPIER_FEEDBACK_WEBHOOK_URL"),
    ZAPIER_UNSUBSCRIBE_WEBHOOK_URL: envOpt("ZAPIER_UNSUBSCRIBE_WEBHOOK_URL"),
    ZAPIER_ERROR_WEBHOOK_URL: envOpt("ZAPIER_ERROR_WEBHOOK_URL"),
    ZAPIER_REFERRAL_WEBHOOK_URL: envOpt("ZAPIER_REFERRAL_WEBHOOK_URL"),
    ZAPIER_CONTENT_WEBHOOK_URL: envOpt("ZAPIER_CONTENT_WEBHOOK_URL"),
    ZAPIER_SEO_WEBHOOK_URL: envOpt("ZAPIER_SEO_WEBHOOK_URL"),
    NEXT_PUBLIC_BOOKING_URL:
      envOpt("NEXT_PUBLIC_BOOKING_URL") ?? envOpt("NEXT_PUBLIC_BOOKING_EMBED_URL"),
    PARENT_GUIDE_ASSET_URL: envOpt("PARENT_GUIDE_ASSET_URL"),
    PARENT_GUIDE_PUBLIC_ASSET_PATH: process.env.PARENT_GUIDE_PUBLIC_ASSET_PATH,
    PARENT_GUIDE_DELIVERY_MODE: process.env.PARENT_GUIDE_DELIVERY_MODE,
    PARENT_GUIDE_STORAGE_BUCKET: process.env.PARENT_GUIDE_STORAGE_BUCKET,
    PARENT_GUIDE_STORAGE_PATH: process.env.PARENT_GUIDE_STORAGE_PATH,
    PARENT_GUIDE_SIGNED_URL_EXPIRES_SECONDS:
      process.env.PARENT_GUIDE_SIGNED_URL_EXPIRES_SECONDS,
    AIRTABLE_CRON_PROCESS_LIMIT: process.env.AIRTABLE_CRON_PROCESS_LIMIT,
    AIRTABLE_SYNC_CONCURRENCY: process.env.AIRTABLE_SYNC_CONCURRENCY,
  });
}

export function appBaseUrl(): string {
  const e = getEnv();
  return e.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function isAgentAirtableEnabled(): boolean {
  return getEnv().AGENT_AIRTABLE_ENABLED === "true";
}
