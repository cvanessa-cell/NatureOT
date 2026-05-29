/**
 * E2E smoke for /book-call, /waitlist, /provider-referral, and homepage CTAs (incl. mobile sticky bar).
 * Does not log secrets. Requires dev server at E2E_BASE_URL (default http://127.0.0.1:3000).
 */
const BASE = (process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000").trim().replace(/\/$/, "");
const FETCH_TIMEOUT_MS = Number(process.env.E2E_FETCH_TIMEOUT_MS ?? 30_000);

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

/** Mirrors src/lib/marketing/core-cta-routes.ts — keep in sync. */
const ROUTES = [
  {
    label: "/",
    path: "/",
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
    mobileOnly: ["Join Waitlist", "Book Call", "md:hidden"],
  },
  {
    label: "/book-call",
    path: "/book-call",
    markers: [
      "Book a Parent Call",
      'id="schedule"',
      "Choose a time that works for your family",
      'href="/waitlist"',
    ],
  },
  {
    label: "/waitlist",
    path: "/waitlist",
    markers: [
      "Join the TreeTots DFW interest list",
      'id="waitlist-form"',
      'href="/book-call"',
      "Start the form",
    ],
  },
  {
    label: "/provider-referral",
    path: "/provider-referral",
    markers: [
      "Refer a family with a clear, privacy-aware next step",
      'id="provider-form"',
      "Start Referral Request",
      'href="/book-call"',
    ],
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function get(path, { mobile = false } = {}) {
  const headers = mobile ? { "User-Agent": MOBILE_UA } : {};
  const res = await fetch(`${BASE}${path}`, {
    redirect: "follow",
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  const body = await res.text();
  return { status: res.status, body };
}

async function postJson(path, payload) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

const results = [];

try {
  for (const route of ROUTES) {
    const desktop = await get(route.path);
    assert(desktop.status === 200, `${route.label} returned ${desktop.status}`);
    for (const marker of route.markers) {
      assert(
        desktop.body.includes(marker),
        `${route.label} missing marker: ${marker}`,
      );
    }
    results.push(`✓ ${route.label} — desktop markers`);

    if (route.mobileOnly?.length) {
      const mobile = await get(route.path, { mobile: true });
      assert(mobile.status === 200, `${route.label} (mobile UA) returned ${mobile.status}`);
      for (const marker of route.mobileOnly) {
        assert(
          mobile.body.includes(marker),
          `${route.label} (mobile) missing: ${marker}`,
        );
      }
      results.push(`✓ ${route.label} — mobile sticky CTA shell`);
    }
  }

  const badWaitlist = await postJson("/api/waitlist", { email: "not-an-email" });
  assert(
    badWaitlist.status === 400,
    `Expected 400 for invalid waitlist payload, got ${badWaitlist.status}`,
  );
  results.push("✓ POST /api/waitlist — rejects invalid payload");

  const badReferral = await postJson("/api/referral-inquiry", {});
  assert(
    badReferral.status === 400,
    `Expected 400 for empty referral payload, got ${badReferral.status}`,
  );
  results.push("✓ POST /api/referral-inquiry — rejects empty payload");

  console.log(`E2E CTA base: ${BASE}\n`);
  for (const line of results) console.log(line);
  console.log(
    "\nManual: confirm Cal.com embed loads on /book-call and submit one waitlist + referral test row in admin.",
  );
} catch (err) {
  console.error("E2E CTA FAILED:", err.message);
  if (results.length) {
    console.error("\nPassed so far:");
    for (const line of results) console.error(line);
  }
  process.exit(1);
}
