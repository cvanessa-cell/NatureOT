/**
 * E2E smoke for /services → /checkout/[service] → POST /api/checkout → success/cancel.
 * Does not log secrets. Requires dev server + .env.local Stripe config.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = (process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000").trim().replace(/\/$/, "");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const path = resolve(root, ".env.local");
  const text = readFileSync(path, "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "follow" });
  const body = await res.text();
  return { status: res.status, body };
}

async function postCheckout(payload) {
  const res = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

const env = loadEnvLocal();
const slug = "nature-play-dropin";
const priceId = env.NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_DROPIN?.trim();

const results = [];

try {
  const services = await get("/services");
  assert(services.status === 200, `/services returned ${services.status}`);
  assert(
    services.body.includes("How online enrollment works"),
    "Missing enrollment steps section",
  );
  assert(services.body.includes("Enroll"), "Missing Enroll price tile CTA");
  assert(
    services.body.includes(`/checkout/${slug}`),
    "Missing checkout link on services page",
  );
  results.push("✓ /services — enrollment steps, price tiles, checkout links");

  const checkout = await get(`/checkout/${slug}`);
  assert(checkout.status === 200, `/checkout/${slug} returned ${checkout.status}`);
  assert(
    checkout.body.includes("Step 2 of 3"),
    "Missing checkout step indicator",
  );
  assert(checkout.body.includes("Pay $35 securely"), "Missing pay button label");
  results.push(`✓ /checkout/${slug} — step indicator and pricing`);

  const cancel = await get(`/checkout/cancel?service=${slug}`);
  assert(cancel.status === 200, `cancel page returned ${cancel.status}`);
  assert(cancel.body.includes("Resume"), "Cancel page missing resume CTA");
  assert(
    cancel.body.includes("Nature Play Groups (Drop-In)"),
    "Cancel page missing service name",
  );
  results.push("✓ /checkout/cancel — service-aware recovery");

  const success = await get("/checkout/success");
  assert(success.status === 200, `success page returned ${success.status}`);
  assert(success.body.includes("Thank you"), "Success page missing confirmation");
  results.push("✓ /checkout/success — renders confirmation shell");

  assert(priceId, "NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_DROPIN not set in .env.local");

  const badPrice = await postCheckout({
    priceId: "price_invalid_mismatch",
    service: "Nature Play Groups (Drop-In)",
    serviceSlug: slug,
    parent: "E2E Parent",
    email: "e2e-parent@example.com",
    location: "outdoor",
  });
  assert(badPrice.status === 400, `Expected 400 for bad price, got ${badPrice.status}`);
  results.push("✓ POST /api/checkout — rejects mismatched price id");

  const session = await postCheckout({
    priceId,
    service: "Nature Play Groups (Drop-In)",
    serviceSlug: slug,
    parent: "E2E Parent",
    email: "e2e-parent@example.com",
    location: "outdoor",
  });
  assert(session.status === 200, `Checkout API returned ${session.status}`);
  assert(
    typeof session.data.url === "string" && session.data.url.includes("checkout.stripe.com"),
    "Checkout API did not return Stripe checkout URL",
  );
  assert(
    typeof session.data.url === "string" && session.data.url.includes("checkout.stripe.com"),
    "Checkout API did not return Stripe checkout URL",
  );
  results.push("✓ POST /api/checkout — creates live Stripe Checkout session");

  const sessionMatch = session.data.url.match(/(cs_[a-zA-Z0-9_]+)/);
  assert(sessionMatch, "Could not parse checkout session id from Stripe URL");
  const successWithSession = await get(`/checkout/success?session_id=${sessionMatch[1]}`);
  assert(successWithSession.status === 200, "Success page with session_id failed");
  assert(
    successWithSession.body.includes("Your spot is booked") ||
      successWithSession.body.includes("Nature Play"),
    "Success page did not show enrollment confirmation copy",
  );
  results.push("✓ /checkout/success?session_id=… — resolves unpaid session gracefully");

  console.log(`E2E base: ${BASE}\n`);
  for (const line of results) console.log(line);
  console.log("\nManual step: open the Stripe URL in a browser and complete test payment.");
  console.log("(Session URL host verified; full URL omitted from logs.)");
} catch (err) {
  console.error("E2E FAILED:", err.message);
  if (results.length) {
    console.error("\nPassed so far:");
    for (const line of results) console.error(line);
  }
  process.exit(1);
}
