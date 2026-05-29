import {
  SUPPORTED_AIRTABLE_MAPPING_TARGETS,
} from "@/lib/airtable/airtable-field-mappers";
import { getEnv, getSupabaseUrl } from "@/lib/env";
import {
  CORE_CTA_MANUAL_QA_PAGES,
  LAUNCH_CONTENT_MANUAL_QA_PAGES,
} from "@/lib/marketing/core-cta-routes";

export type ReadinessTone =
  | "complete"
  | "needs_setup"
  | "dry_run_only"
  | "warning"
  | "blocked";

export type ReadinessRow = {
  id: string;
  label: string;
  tone: ReadinessTone;
  detail?: string;
};

/** Server-only snapshot — no secrets surfaced, only booleans + modes. */
export function getOperationalReadinessSections(): Record<string, ReadinessRow[]> {
  const env = getEnv();

  const supabaseOk = Boolean(getSupabaseUrl() && env.SUPABASE_SERVICE_ROLE_KEY);
  const resendOk = Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
  const emailDry = env.EMAIL_DRY_RUN === "true";

  const airtableCreds = Boolean(env.AIRTABLE_API_KEY && env.AIRTABLE_BASE_ID);
  const airtableDry = env.AIRTABLE_DRY_RUN === "true";
  const airtableSyncEnabled = env.AIRTABLE_SYNC_ENABLED === "true";

  const zapEnabled = env.ZAPIER_ENABLED === "true";
  const zapDry = env.ZAPIER_DRY_RUN === "true";
  const slackEnabled = env.SLACK_ENABLED === "true";
  const slackDry = env.SLACK_DRY_RUN === "true";
  const slackWebhook = Boolean(env.SLACK_WEBHOOK_URL?.trim());

  const bookingConfigured = Boolean(
    env.NEXT_PUBLIC_BOOKING_EMBED_URL ?? env.NEXT_PUBLIC_BOOKING_URL
  );

  const pgMode = (env.PARENT_GUIDE_DELIVERY_MODE ?? "public_asset")
    .trim()
    .toLowerCase();
  const parentGuideSignedReady = Boolean(
    env.PARENT_GUIDE_STORAGE_BUCKET?.trim() &&
      env.PARENT_GUIDE_STORAGE_PATH?.trim() &&
      env.SUPABASE_SERVICE_ROLE_KEY
  );
  const parentGuideTone: ReadinessTone =
    pgMode === "signed_url"
      ? parentGuideSignedReady
        ? "complete"
        : "needs_setup"
      : pgMode === "signed_url_future" && env.PARENT_GUIDE_ASSET_URL
        ? "complete"
        : pgMode === "public_asset" ||
            !env.PARENT_GUIDE_DELIVERY_MODE ||
            pgMode === "signed_url_future"
          ? "complete"
          : "warning";

  const cronSecretSet = Boolean(env.CRON_SECRET?.trim());
  const cronLimitSet = Boolean(env.AIRTABLE_CRON_PROCESS_LIMIT?.trim());

  const infrastructure: ReadinessRow[] = [
    {
      id: "supabase",
      label: "Supabase URL + service role available",
      tone: supabaseOk ? "complete" : "needs_setup",
      detail: supabaseOk
        ? undefined
        : "Set NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    },
    {
      id: "resend",
      label: "Resend API + EMAIL_FROM configured",
      tone: resendOk ? "complete" : "needs_setup",
    },
    {
      id: "emailDry",
      label: "Email dry-run acknowledged",
      tone: emailDry || !resendOk ? "dry_run_only" : "warning",
      detail: emailDry
        ? "EMAIL_DRY_RUN=true — transactional sends suppressed."
        : resendOk
          ? "Live email mode — confirm domain auth before blast volumes."
          : undefined,
    },
    {
      id: "airtable",
      label: "Airtable PAT + Base ID configured",
      tone: airtableCreds ? "complete" : "needs_setup",
    },
    {
      id: "airtableMode",
      label: "Airtable sync mode",
      tone: airtableSyncEnabled
        ? airtableDry
          ? "dry_run_only"
          : "complete"
        : "dry_run_only",
      detail: airtableDry
        ? "AIRTABLE_DRY_RUN=true — worker completes jobs without outbound."
        : airtableSyncEnabled
          ? "Live Airtable push enabled."
          : "AIRTABLE_SYNC_ENABLED is not true — jobs stay queued until flipped on.",
    },
    {
      id: "airtableFieldMapper",
      label: "Airtable field mappers loaded for core tables",
      tone: "complete",
      detail: `Targets: ${SUPPORTED_AIRTABLE_MAPPING_TARGETS.length} table whitelists in airtable-field-mappers.ts — unknown keys are dropped before Airtable. Start with AIRTABLE_DRY_RUN=true; smoke-test POST /api/admin/airtable/process-pending before cron.`,
    },
    {
      id: "airtableRetryApi",
      label: "Failed job retry API deployed",
      tone: "complete",
      detail:
        "POST /api/admin/airtable/retry-failed (privileged) — modes reset_only vs process_now.",
    },
    {
      id: "airtableCronSecret",
      label: "Cron secret for Airtable processor",
      tone: cronSecretSet ? "complete" : "needs_setup",
      detail: cronSecretSet
        ? "CRON_SECRET enables GET/POST /api/cron/process-airtable-sync with Bearer auth."
        : "Set CRON_SECRET before enabling hosted cron; test manual process-pending first.",
    },
    {
      id: "airtableCronLimit",
      label: "Airtable cron dequeue limit",
      tone: cronLimitSet ? "complete" : "warning",
      detail: cronLimitSet
        ? `AIRTABLE_CRON_PROCESS_LIMIT=${env.AIRTABLE_CRON_PROCESS_LIMIT}.`
        : "Optional: set AIRTABLE_CRON_PROCESS_LIMIT (default 25 in code).",
    },
    {
      id: "zapier",
      label: "Zapier relays",
      tone: zapEnabled ? (zapDry ? "dry_run_only" : "complete") : "dry_run_only",
      detail: !zapEnabled
        ? "ZAPIER_ENABLED=false — relays won't POST externally."
        : zapDry
          ? "ZAPIER_DRY_RUN=true — payloads log only."
          : "Live Zapier relays enabled.",
    },
    {
      id: "slack",
      label: "Slack new-lead alerts (direct webhook)",
      tone: slackEnabled
        ? slackDry
          ? "dry_run_only"
          : slackWebhook
            ? "complete"
            : "needs_setup"
        : "dry_run_only",
      detail: !slackEnabled
        ? "SLACK_ENABLED=false — use direct Slack instead of paid Zapier Catch Hook."
        : slackDry
          ? "SLACK_DRY_RUN=true — messages log only."
          : slackWebhook
            ? "Live Slack alerts on new quiz leads."
            : "Set SLACK_WEBHOOK_URL from Slack Incoming Webhooks.",
    },
    {
      id: "bookingUrl",
      label: "Public booking/embed URL configured",
      tone: bookingConfigured ? "complete" : "needs_setup",
      detail: bookingConfigured
        ? undefined
        : "Set NEXT_PUBLIC_BOOKING_EMBED_URL or NEXT_PUBLIC_BOOKING_URL.",
    },
    {
      id: "guide",
      label: "Parent guide delivery mode configured",
      tone: parentGuideTone,
      detail:
        pgMode === "signed_url"
          ? parentGuideSignedReady
            ? "Signed URL mode uses Supabase Storage (server-side only)."
            : "signed_url mode requires PARENT_GUIDE_STORAGE_BUCKET, PARENT_GUIDE_STORAGE_PATH, and service role."
          : pgMode === "signed_url_future" && env.PARENT_GUIDE_ASSET_URL
            ? "signed_url_future + PARENT_GUIDE_ASSET_URL redirect."
            : "Default public asset at /guides/outdoor-sensory-activities-texas-kids.html or override paths.",
    },
  ];

  const complianceSafety: ReadinessRow[] = [
    {
      id: "marketingDisclaimers",
      label: "Marketing disclaimers on public pages",
      tone: "complete",
      detail:
        "Verify quiz, workshop, and parent guide disclaimers with counsel when opening new states.",
    },
    {
      id: "consents",
      label: "Consent logging + unsubscribe path",
      tone: "complete",
      detail: "Consent logged to Supabase; operational unsubscribe endpoints exist.",
    },
    {
      id: "noClinicalMarketingFields",
      label: "No diagnosis/medical narrative fields on marketing captures",
      tone: "complete",
    },
    {
      id: "noPhiExternal",
      label: "Operational rule: no PHI in Airtable or Zapier payloads",
      tone: "complete",
      detail:
        "Growth OS strips blocked keys; Growth OS must not add child clinical, insurance, or school-record fields to marketing syncs.",
    },
    {
      id: "testimonials",
      label: "Testimonial publishing requires authorization + publish flags",
      tone: "complete",
      detail: "Outbound automations block testimonials without authorization linkage.",
    },
    {
      id: "reviews",
      label: "Review requests avoid incentivizing positive sentiment",
      tone: "complete",
      detail: "Maintain neutral language in outbound review scripts.",
    },
    {
      id: "campaignAuthenticity",
      label:
        "Campaign authenticity — no fabricated users, bots, fake profiles, fake reviews, fake testimonials, fake advocates, or fake engagement",
      tone: "complete",
      detail:
        "Hard guardrail: do not use campaign/automation flows to invent people, reviews, testimonials, or synthetic engagement. Operational policy + admin campaign screens; human verification before any outreach that looks like grassroots activity.",
    },
  ];

  const launchContent: ReadinessRow[] = [
    ...CORE_CTA_MANUAL_QA_PAGES.map(({ id, path, title }) => ({
      id,
      label: `${title} (${path}) manual QA`,
      tone: "warning" as ReadinessTone,
      detail:
        "Run npm run e2e:cta-routes with dev server, then mobile click-through (hero + sticky bar + forms).",
    })),
    ...LAUNCH_CONTENT_MANUAL_QA_PAGES.map(({ id, path, title }) => ({
      id,
      label: `${title} (${path}) manual QA`,
      tone: "warning" as ReadinessTone,
      detail: "Schedule a scripted click-through ahead of regional promos.",
    })),
    {
      id: "localSeo",
      label: "Local SEO `/texas/*` city pages wording check",
      tone: "warning",
    },
  ];

  const automations: ReadinessRow[] = [
    {
      id: "drySmoke",
      label: "Run dry-run drills for emails, Zapier + Airtable worker",
      tone:
        emailDry || airtableDry || zapDry || !airtableSyncEnabled
          ? "dry_run_only"
          : "warning",
      detail:
        "Use admin tooling with EMAIL_DRY_RUN / ZAPIER_DRY_RUN / AIRTABLE_DRY_RUN toggles before flipping live switches.",
    },
    {
      id: "failureHandling",
      label: "Failed Airtable job retry playbook",
      tone: airtableDry ? "dry_run_only" : "warning",
      detail:
        "Use /admin/airtable → Retry failed; review retry_count + retry_metadata without exposing raw PHI.",
    },
  ];

  const adminWorkflows: ReadinessRow[] = [
    {
      id: "staffLogin",
      label: "Staff/admin login exercised",
      tone: supabaseOk ? "warning" : "blocked",
    },
    {
      id: "dashboardVisibility",
      label: "Leads, registrations, referral inquiries dashboards visible post-login",
      tone: supabaseOk ? "complete" : "needs_setup",
    },
  ];

  return {
    infrastructure,
    complianceSafety,
    launchContent,
    automations,
    adminWorkflows,
  };
}
