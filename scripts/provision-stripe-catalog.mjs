/**
 * Creates TreeTots Stripe Products + Prices (test or live per STRIPE_SECRET_KEY)
 * and writes Stripe Price IDs into .env.local.
 *
 * Usage: node --env-file=.env.local scripts/provision-stripe-catalog.mjs
 * Dry run: node --env-file=.env.local scripts/provision-stripe-catalog.mjs --dry-run
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import Stripe from "stripe";

const CATALOG = [
  {
    env: "NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_DROPIN",
    name: "Nature Play Groups (Drop-In)",
    amount: 3500,
    metadata: { checkout_slug: "nature-play-dropin" },
  },
  {
    env: "NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_6_PASS",
    name: "Nature Play Groups (6-Session Pass)",
    amount: 18000,
    metadata: { checkout_slug: "nature-play-pass" },
  },
  {
    env: "NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_SINGLE",
    name: "Nature-Based OT Group (Per Session)",
    amount: 8500,
    metadata: { checkout_slug: "ot-group" },
  },
  {
    env: "NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_6_WEEK",
    name: "Nature-Based OT Group (6-Week Series)",
    amount: 48000,
    metadata: { checkout_slug: "ot-group-series" },
  },
  {
    env: "NEXT_PUBLIC_STRIPE_PRICE_REFLEX_INTENSIVE",
    name: "Reflex Integration Intensive",
    amount: 49700,
    metadata: { checkout_slug: "reflex" },
  },
  {
    env: "STRIPE_TREETOTS_MEMBERSHIP_MONTHLY_PRICE_ID",
    name: "TreeTots Family Membership (Monthly)",
    amount: 4900,
    recurring: { interval: "month" },
    metadata: {
      checkout_slug: "family-membership-monthly",
      plan_type: "family_membership",
      billing_interval: "monthly",
    },
  },
  {
    env: "STRIPE_TREETOTS_MEMBERSHIP_ANNUAL_PRICE_ID",
    name: "TreeTots Family Membership (Annual)",
    amount: 49900,
    recurring: { interval: "year" },
    metadata: {
      checkout_slug: "family-membership-annual",
      plan_type: "family_membership",
      billing_interval: "annual",
    },
  },
];

const dryRun = process.argv.includes("--dry-run");
const key = process.env.STRIPE_SECRET_KEY?.trim();
if (!key) {
  console.error("STRIPE_SECRET_KEY is missing in .env.local");
  process.exit(1);
}

const stripe = new Stripe(key);
const mode = key.startsWith("sk_live") ? "live" : "test";

async function findExistingPrice(item) {
  const prices = await stripe.prices.list({ limit: 100, expand: ["data.product"] });
  const expectedInterval = item.recurring?.interval ?? null;
  return (
    prices.data.find(
      (p) =>
        p.active &&
        p.unit_amount === item.amount &&
        p.currency === "usd" &&
        (p.recurring?.interval ?? null) === expectedInterval &&
        (p.metadata?.checkout_slug === item.metadata.checkout_slug ||
          (typeof p.product === "object" &&
            p.product?.metadata?.checkout_slug === item.metadata.checkout_slug)),
    ) ?? null
  );
}

async function ensurePrice(item) {
  const existing = await findExistingPrice(item);
  if (existing) {
    return { env: item.env, priceId: existing.id, created: false };
  }

  if (dryRun) {
    return { env: item.env, priceId: `(dry-run-${item.metadata.checkout_slug})`, created: true };
  }

  const product = await stripe.products.create({
    name: item.name,
    metadata: item.metadata,
  });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: item.amount,
    currency: "usd",
    metadata: item.metadata,
    ...(item.recurring ? { recurring: item.recurring } : {}),
  });
  return { env: item.env, priceId: price.id, created: true };
}

function upsertEnvLocal(updates) {
  const envPath = path.join(process.cwd(), ".env.local");
  let text = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  for (const { env, priceId } of updates) {
    const line = `${env}=${priceId}`;
    const re = new RegExp(`^${env}=.*$`, "m");
    if (re.test(text)) {
      text = text.replace(re, line);
    } else {
      const block =
        text.endsWith("\n") || text.length === 0
          ? `\n# Stripe prices (${mode}) — provision-stripe-catalog.mjs\n${line}\n`
          : `\n\n# Stripe prices (${mode}) — provision-stripe-catalog.mjs\n${line}\n`;
      text += block;
    }
  }
  if (!dryRun) {
    fs.writeFileSync(envPath, text, "utf8");
  }
}

const results = [];
for (const item of CATALOG) {
  results.push(await ensurePrice(item));
}

if (!dryRun) {
  upsertEnvLocal(results);
}

console.log(
  JSON.stringify(
    {
      mode,
      dryRun,
      prices: results.map((r) => ({
        env: r.env,
        set: Boolean(r.priceId),
        created: r.created,
      })),
      next: dryRun
        ? "Re-run without --dry-run to create prices and update .env.local"
        : "Restart dev server (npm run dev) then open /checkout/nature-play-pass",
    },
    null,
    2,
  ),
);
