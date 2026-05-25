/**
 * CLI auth status + interactive login for integrations referenced in .env.
 */

import { isSanityLoggedIn, sanityCliBin, sanityLoginLabel } from "./sanity-cli-auth.mjs";

function has(val) {
  return Boolean(val && String(val).trim());
}

function zapConfigured(env) {
  return (
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
    ].some((k) => has(env[k]))
  );
}

function supabaseRef(env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim() || env.SUPABASE_URL?.trim();
  if (!url) return null;
  try {
    const ref = new URL(url).hostname.split(".")[0];
    return ref && ref !== "supabase" ? ref : null;
  } catch {
    return null;
  }
}

function bookingHost(env) {
  const raw =
    env.NEXT_PUBLIC_BOOKING_EMBED_URL?.trim() || env.NEXT_PUBLIC_BOOKING_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

/**
 * @param {Record<string, string>} env
 * @param {{ hasGitRepo?: boolean }} opts
 */
export function buildIntegrationAuthPlan(env, opts = {}) {
  const plan = [];

  if (opts.hasGitRepo !== false) {
    plan.push({
      id: "github",
      label: "GitHub CLI (gh)",
      configured: true,
      method: "cli",
      checkCmd: "gh auth status",
      loginCmd: "gh auth login",
      loginHint: "Install: https://cli.github.com/",
      fallbackUrl: "https://github.com/login",
    });
  }

  plan.push({
    id: "vercel",
    label: "Vercel CLI",
    configured: true,
    method: "cli",
    checkCmd: "npx.cmd --yes vercel@53 whoami",
    checkCmdAlt: "npx --yes vercel@53 whoami",
    loginCmd: "npx.cmd --yes vercel@53 login",
    loginCmdAlt: "npx --yes vercel@53 login",
    loginHint: "Or: npm run vercel:login",
    fallbackUrl: "https://vercel.com/login",
  });

  if (has(env.NEXT_PUBLIC_SANITY_PROJECT_ID)) {
    plan.push({
      id: "sanity",
      label: "Sanity CLI",
      configured: true,
      method: "sanity",
      loginHint: "npm run sanity:login",
      fallbackUrl: "https://www.sanity.io/login",
    });
  }

  if (supabaseRef(env)) {
    plan.push({
      id: "supabase",
      label: "Supabase CLI",
      configured: true,
      method: "cli",
      checkCmd: "npx.cmd --yes supabase@latest projects list -o json",
      checkCmdAlt: "npx --yes supabase@latest projects list -o json",
      loginCmd: "npx.cmd --yes supabase@latest login",
      loginCmdAlt: "npx --yes supabase@latest login",
      loginHint: "npm run supabase:link after login",
      fallbackUrl: "https://supabase.com/dashboard/account/tokens",
    });
  }

  if (has(env.STRIPE_SECRET_KEY)) {
    plan.push({
      id: "stripe",
      label: "Stripe CLI",
      configured: true,
      method: "cli",
      checkCmd: "stripe config --list",
      loginCmd: "stripe login",
      loginHint: "Install: https://stripe.com/docs/stripe-cli",
      fallbackUrl: "https://dashboard.stripe.com/login",
    });
  }

  if (has(env.TWILIO_ACCOUNT_SID)) {
    plan.push({
      id: "twilio",
      label: "Twilio CLI",
      configured: true,
      method: "cli",
      checkCmd: "twilio profiles:list",
      loginCmd: "twilio login",
      loginHint: "Install: npm i -g twilio-cli",
      fallbackUrl: "https://www.twilio.com/login",
    });
  }

  if (zapConfigured(env)) {
    plan.push({
      id: "zapier",
      label: "Zapier CLI",
      configured: true,
      method: "cli",
      checkCmd: "npx.cmd --yes zapier-platform-cli@latest whoami",
      checkCmdAlt: "npx --yes zapier-platform-cli@latest whoami",
      checkCmdGlobal: "zapier whoami",
      loginCmd: "npx.cmd --yes zapier-platform-cli@latest login",
      loginCmdAlt: "npx --yes zapier-platform-cli@latest login",
      loginCmdGlobal: "zapier login",
      loginHint: "Developer CLI for Zapier apps/Zaps",
      fallbackUrl: "https://zapier.com/app/login",
    });
  }

  if (has(env.AIRTABLE_API_KEY) || has(env.AIRTABLE_BASE_ID)) {
    plan.push({
      id: "airtable",
      label: "Airtable (PAT)",
      configured: true,
      method: "browser",
      loginHint: "Create a personal access token — no interactive CLI login",
      fallbackUrl: "https://airtable.com/create/tokens",
    });
  }

  if (has(env.RESEND_API_KEY) || has(env.EMAIL_FROM)) {
    plan.push({
      id: "resend",
      label: "Resend (API key)",
      configured: true,
      method: "browser",
      loginHint: "API keys are created in the Resend dashboard",
      fallbackUrl: "https://resend.com/api-keys",
    });
  }

  if (has(env.OPENAI_API_KEY)) {
    plan.push({
      id: "openai",
      label: "OpenAI (API key)",
      configured: true,
      method: "browser",
      loginHint: "Platform API keys — no OAuth CLI for this project",
      fallbackUrl: "https://platform.openai.com/api-keys",
    });
  }

  if (has(env.NEXT_PUBLIC_META_PIXEL_ID)) {
    plan.push({
      id: "meta",
      label: "Meta Business / Events",
      configured: true,
      method: "browser",
      loginHint: "Browser login for Events Manager & CAPI tokens",
      fallbackUrl: "https://business.facebook.com/",
    });
  }

  const host = bookingHost(env);
  if (host) {
    const isCal = host.includes("cal.com");
    const isCalendly = host.includes("calendly.com");
    plan.push({
      id: "booking",
      label: isCal ? "Cal.com" : isCalendly ? "Calendly" : "Booking provider",
      configured: true,
      method: "browser",
      loginHint: "Sign in to manage your booking link",
      fallbackUrl: isCal
        ? "https://cal.com/login"
        : isCalendly
          ? "https://calendly.com/login"
          : `https://${host}/`,
    });
  }

  return plan;
}

function tryCheck(tryRun, cmd) {
  if (!cmd) return { ok: false };
  const r = tryRun(cmd);
  if (r.ok) return r;
  return { ok: false };
}

function checkCli(tryRun, item, env) {
  if (item.method === "sanity") {
    if (!isSanityLoggedIn()) return { ok: false, detail: "not logged in" };
    return { ok: true, detail: sanityLoginLabel() || "authenticated" };
  }
  if (item.method === "browser") {
    const configured =
      item.id === "airtable"
        ? has(env.AIRTABLE_API_KEY)
        : item.id === "resend"
          ? has(env.RESEND_API_KEY)
          : item.id === "openai"
            ? has(env.OPENAI_API_KEY)
            : item.id === "meta"
              ? has(env.NEXT_PUBLIC_META_PIXEL_ID)
              : item.id === "booking"
                ? has(
                    env.NEXT_PUBLIC_BOOKING_EMBED_URL || env.NEXT_PUBLIC_BOOKING_URL,
                  )
                : true;
    return {
      ok: configured,
      detail: configured ? "configured in .env.local" : "missing in .env.local",
    };
  }

  let r = tryCheck(tryRun, item.checkCmd);
  if (!r.ok && item.checkCmdAlt) r = tryCheck(tryRun, item.checkCmdAlt);
  if (!r.ok && item.checkCmdGlobal) r = tryCheck(tryRun, item.checkCmdGlobal);
  if (!r.ok) {
    const missing = /not recognized|not found|ENOENT/i.test(String(r.err));
    return {
      ok: false,
      detail: missing ? "CLI not installed" : "not authenticated",
    };
  }
  const line = (r.out || "").split(/\r?\n/).find((l) => l.trim())?.trim();
  return { ok: true, detail: line || "authenticated" };
}

/**
 * @param {ReturnType<typeof buildIntegrationAuthPlan>} plan
 */
export function auditIntegrationAuth(plan, tryRun, env) {
  return plan.map((item) => {
    const { ok, detail } = checkCli(tryRun, item, env);
    return { ...item, authenticated: ok, statusDetail: detail };
  });
}

export function printAuthAudit(results) {
  console.log("\nCLI / auth status (.env integrations):\n");
  for (const r of results) {
    const mark = r.authenticated ? "✓" : "✗";
    const suffix = r.statusDetail ? ` — ${r.statusDetail}` : "";
    console.log(`  ${mark} ${r.label}${suffix}`);
    if (!r.authenticated && r.loginHint) {
      console.log(`      → ${r.loginHint}`);
    }
  }
}

/**
 * @param {Awaited<ReturnType<typeof auditIntegrationAuth>>} results
 */
function cliInstalled(tryRun, item) {
  if (item.method === "sanity") return { ok: true };
  if (item.method === "browser") return { ok: false };
  let r = tryCheck(tryRun, item.checkCmd);
  if (r.ok) return { ok: true };
  r = tryCheck(tryRun, item.checkCmdAlt);
  if (r.ok) return { ok: true };
  if (item.checkCmdGlobal) return tryCheck(tryRun, item.checkCmdGlobal);
  const bin = item.loginCmd?.split(/\s+/)[0] || item.loginCmdGlobal?.split(/\s+/)[0];
  if (bin && !bin.includes("npx")) return tryRun(`where ${bin}`);
  return { ok: true };
}

/**
 * @param {Awaited<ReturnType<typeof auditIntegrationAuth>>} results
 */
export async function runIntegrationLogins(results, helpers) {
  const { doLogin, tryRun, run, openUrl, spawnInteractive, root } = helpers;
  if (!doLogin) return;

  console.log("\n── Interactive auth (--login) ──\n");

  for (const item of results) {
    if (item.authenticated && item.method === "cli") continue;

    if (item.method === "sanity") {
      if (item.authenticated) continue;
      console.log(`→ ${item.label}: CLI login (browser)…`);
      try {
        run(`node "${sanityCliBin}" login`, { silent: false });
      } catch {
        if (item.fallbackUrl) openUrl(item.fallbackUrl);
      }
      continue;
    }

    if (item.method === "browser") {
      if (item.authenticated) continue;
      console.log(`→ ${item.label}: ${item.loginHint}`);
      if (item.fallbackUrl) openUrl(item.fallbackUrl);
      continue;
    }

    const installed = cliInstalled(tryRun, item);
    if (!installed.ok) {
      console.log(`→ ${item.label}: CLI not installed — opening browser…`);
      if (item.fallbackUrl) openUrl(item.fallbackUrl);
      if (item.loginHint) console.log(`   ${item.loginHint}`);
      continue;
    }

    console.log(`→ ${item.label}: starting CLI login…`);
    let ok = false;
    if (item.loginCmd) ok = await spawnInteractive(item.loginCmd, root);
    if (!ok && item.loginCmdAlt) ok = await spawnInteractive(item.loginCmdAlt, root);
    if (!ok && item.loginCmdGlobal) ok = await spawnInteractive(item.loginCmdGlobal, root);
    if (!ok && item.fallbackUrl) {
      console.log(`   Opening fallback: ${item.fallbackUrl}`);
      openUrl(item.fallbackUrl);
    }
  }
}
