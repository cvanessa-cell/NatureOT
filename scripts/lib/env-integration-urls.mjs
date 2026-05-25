/**
 * Derive vendor dashboard URLs from env vars (.env / .env.local).
 * Only returns integrations with non-empty configured values.
 */

function has(val) {
  return Boolean(val && String(val).trim());
}

function addUnique(seen, list, label, url) {
  if (!url || seen.has(url)) return;
  seen.add(url);
  list.push({ label, url });
}

/** @param {Record<string, string>} env */
export function collectEnvIntegrationUrls(env, ctx = {}) {
  const seen = new Set();
  const list = [];

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim() || env.SUPABASE_URL?.trim();
  if (has(supabaseUrl)) {
    try {
      const ref = new URL(supabaseUrl).hostname.split(".")[0];
      if (ref && ref !== "supabase") {
        addUnique(seen, list, "Supabase project", `https://supabase.com/dashboard/project/${ref}`);
        addUnique(
          seen,
          list,
          "Supabase SQL editor",
          `https://supabase.com/dashboard/project/${ref}/sql/new`,
        );
        addUnique(
          seen,
          list,
          "Supabase GitHub integration",
          `https://supabase.com/dashboard/project/${ref}/settings/integrations`,
        );
      }
    } catch {
      /* invalid URL */
    }
  }

  if (has(env.AIRTABLE_API_KEY) || has(env.AIRTABLE_BASE_ID)) {
    const baseId = env.AIRTABLE_BASE_ID?.trim();
    addUnique(
      seen,
      list,
      "Airtable",
      baseId ? `https://airtable.com/${baseId}` : "https://airtable.com/",
    );
  }

  if (has(env.RESEND_API_KEY) || has(env.EMAIL_FROM)) {
    addUnique(seen, list, "Resend", "https://resend.com/emails");
    addUnique(seen, list, "Resend domains", "https://resend.com/domains");
  }

  const zapConfigured =
    env.ZAPIER_ENABLED === "true" ||
    [
      "ZAPIER_NEW_LEAD_WEBHOOK_URL",
      "ZAPIER_WAITLIST_WEBHOOK_URL",
      "ZAPIER_WORKSHOP_WEBHOOK_URL",
      "ZAPIER_BOOKING_WEBHOOK_URL",
      "ZAPIER_FEEDBACK_WEBHOOK_URL",
      "ZAPIER_UNSUBSCRIBE_WEBHOOK_URL",
      "ZAPIER_ERROR_WEBHOOK_URL",
      "ZAPIER_REFERRAL_WEBHOOK_URL",
      "ZAPIER_CONTENT_WEBHOOK_URL",
      "ZAPIER_SEO_WEBHOOK_URL",
    ].some((k) => has(env[k]));
  if (zapConfigured) {
    addUnique(seen, list, "Zapier Zaps", "https://zapier.com/app/zaps");
  }

  const stripeKey = env.STRIPE_SECRET_KEY?.trim();
  if (has(stripeKey)) {
    const testMode = stripeKey.startsWith("sk_test_");
    addUnique(
      seen,
      list,
      `Stripe dashboard${testMode ? " (test)" : ""}`,
      testMode ? "https://dashboard.stripe.com/test/dashboard" : "https://dashboard.stripe.com/dashboard",
    );
  }

  if (has(env.TWILIO_ACCOUNT_SID)) {
    addUnique(seen, list, "Twilio console", "https://console.twilio.com/");
  }

  const pixelId = env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  if (has(pixelId)) {
    addUnique(
      seen,
      list,
      "Meta Events Manager (Pixel)",
      `https://www.facebook.com/events_manager2/list/pixel/${pixelId}`,
    );
    addUnique(seen, list, "Meta Business Suite", "https://business.facebook.com/");
  }

  if (has(env.OPENAI_API_KEY)) {
    addUnique(seen, list, "OpenAI platform", "https://platform.openai.com/");
  }

  const booking =
    env.NEXT_PUBLIC_BOOKING_EMBED_URL?.trim() || env.NEXT_PUBLIC_BOOKING_URL?.trim();
  if (has(booking)) {
    addUnique(seen, list, "Booking (Cal.com / Calendly)", booking);
  }

  if (has(env.VERCEL_TOKEN) || ctx.vercelProjectId) {
    if (ctx.urls?.vercelProject) {
      addUnique(seen, list, "Vercel project", ctx.urls.vercelProject);
    }
    if (ctx.urls?.vercelDeployments) {
      addUnique(seen, list, "Vercel deployments", ctx.urls.vercelDeployments);
    }
    if (ctx.vercelTeamId && ctx.vercelProjectName) {
      const slug = ctx.vercelTeamSlug || ctx.vercelTeamId.replace(/^team_/, "");
      addUnique(
        seen,
        list,
        "Vercel environment variables",
        `https://vercel.com/${slug}/${ctx.vercelProjectName}/settings/environment-variables`,
      );
    }
  }

  if (has(env.NEXT_PUBLIC_SANITY_PROJECT_ID)) {
    const pid = env.NEXT_PUBLIC_SANITY_PROJECT_ID.trim();
    if (ctx.urls?.sanityManage) addUnique(seen, list, "Sanity project", ctx.urls.sanityManage);
    else addUnique(seen, list, "Sanity manage", `https://www.sanity.io/manage/project/${pid}`);
    if (ctx.studioUrl) addUnique(seen, list, "Sanity Studio", ctx.studioUrl);
  }

  if (has(env.NEXT_PUBLIC_APP_URL)) {
    const site = env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, "");
    addUnique(seen, list, "App (NEXT_PUBLIC_APP_URL)", site);
    addUnique(seen, list, "Local admin", `${site}/admin`);
  }

  return list;
}
