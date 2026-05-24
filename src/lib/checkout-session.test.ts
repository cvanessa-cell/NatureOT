import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCheckoutSessionSummary } from "@/lib/checkout-session";

const stripeMocks = vi.hoisted(() => ({
  isStripeConfigured: vi.fn(() => true),
  retrieve: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  isStripeConfigured: stripeMocks.isStripeConfigured,
  getStripe: () => ({
    checkout: {
      sessions: {
        retrieve: stripeMocks.retrieve,
      },
    },
  }),
}));

describe("getCheckoutSessionSummary", () => {
  beforeEach(() => {
    stripeMocks.isStripeConfigured.mockReturnValue(true);
    stripeMocks.retrieve.mockReset();
  });

  it("returns null for invalid session ids", async () => {
    expect(await getCheckoutSessionSummary("")).toBeNull();
    expect(await getCheckoutSessionSummary("not_stripe")).toBeNull();
    expect(stripeMocks.retrieve).not.toHaveBeenCalled();
  });

  it("returns null when Stripe is not configured", async () => {
    stripeMocks.isStripeConfigured.mockReturnValue(false);
    expect(await getCheckoutSessionSummary("cs_test_123")).toBeNull();
  });

  it("returns null for unpaid sessions", async () => {
    stripeMocks.retrieve.mockResolvedValue({
      payment_status: "unpaid",
      status: "open",
      metadata: {},
    });
    expect(await getCheckoutSessionSummary("cs_test_unpaid")).toBeNull();
  });

  it("maps paid session metadata to a summary", async () => {
    stripeMocks.retrieve.mockResolvedValue({
      payment_status: "paid",
      status: "complete",
      amount_total: 3500,
      metadata: {
        checkout_slug: "nature-play-dropin",
        service_name: "Nature Play Groups (Drop-In)",
      },
      customer_details: { email: "parent@example.com" },
    });

    const summary = await getCheckoutSessionSummary("cs_test_paid");
    expect(summary).toEqual({
      serviceName: "Nature Play Groups (Drop-In)",
      amountDisplay: "$35",
      checkoutSlug: "nature-play-dropin",
      email: "parent@example.com",
    });
  });
});
