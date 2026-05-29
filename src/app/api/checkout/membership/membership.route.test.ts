import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const stripeMocks = vi.hoisted(() => ({
  isStripeConfigured: vi.fn(() => false),
  createSession: vi.fn(),
  writeAuditLog: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  isStripeConfigured: stripeMocks.isStripeConfigured,
  getStripe: () => ({
    checkout: {
      sessions: {
        create: stripeMocks.createSession,
      },
    },
  }),
}));

vi.mock("@/lib/env", () => ({
  appBaseUrl: () => "http://localhost:3000",
}));

vi.mock("@/lib/audit", () => ({
  writeAuditLog: stripeMocks.writeAuditLog,
}));

vi.mock("@/lib/membership-catalog", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/membership-catalog")>();
  return {
    ...actual,
    getMembershipCheckoutOption: vi.fn((billingInterval: "monthly" | "annual") => ({
      billingInterval,
      checkoutSlug:
        billingInterval === "annual"
          ? "family-membership-annual"
          : "family-membership-monthly",
      name: `TreeTots Family Membership (${billingInterval})`,
      amount: billingInterval === "annual" ? 499 : 49,
      priceLabel: billingInterval === "annual" ? "$499/year" : "$49/month",
      priceId: billingInterval === "annual" ? "price_annual" : "price_monthly",
      priceEnvKey:
        billingInterval === "annual"
          ? "STRIPE_TREETOTS_MEMBERSHIP_ANNUAL_PRICE_ID"
          : "STRIPE_TREETOTS_MEMBERSHIP_MONTHLY_PRICE_ID",
    })),
  };
});

function postMembershipCheckout(body: Record<string, unknown>) {
  return POST(
    new Request("http://localhost/api/checkout/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

const validBody = {
  billingInterval: "monthly",
  parent: "Alex Parent",
  email: "parent@example.com",
};

describe("POST /api/checkout/membership", () => {
  beforeEach(() => {
    stripeMocks.isStripeConfigured.mockReturnValue(false);
    stripeMocks.createSession.mockReset();
    stripeMocks.writeAuditLog.mockResolvedValue(undefined);
  });

  it("returns 503 when Stripe is not configured", async () => {
    const res = await postMembershipCheckout(validBody);
    expect(res.status).toBe(503);
    const data = (await res.json()) as { error?: string };
    expect(data.error).toMatch(/not configured/i);
  });

  it("rejects invalid membership intervals", async () => {
    stripeMocks.isStripeConfigured.mockReturnValue(true);
    const res = await postMembershipCheckout({ ...validBody, billingInterval: "weekly" });
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error?: string };
    expect(data.error).toMatch(/invalid request/i);
  });

  it("creates a Stripe subscription Checkout session", async () => {
    stripeMocks.isStripeConfigured.mockReturnValue(true);
    stripeMocks.createSession.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/c/pay/cs_test_123",
    });

    const res = await postMembershipCheckout(validBody);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { url?: string };
    expect(data.url).toBe("https://checkout.stripe.com/c/pay/cs_test_123");

    expect(stripeMocks.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        line_items: [{ price: "price_monthly", quantity: 1 }],
        customer_email: "parent@example.com",
        success_url:
          "http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=membership",
        cancel_url: "http://localhost:3000/checkout/cancel?type=membership&interval=monthly",
        metadata: expect.objectContaining({
          plan_type: "family_membership",
          billing_interval: "monthly",
          source: "website",
          checkout_slug: "family-membership-monthly",
          parent_name: "Alex Parent",
        }),
      }),
    );
  });
});
