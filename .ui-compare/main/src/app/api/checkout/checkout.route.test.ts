import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const stripeMocks = vi.hoisted(() => ({
  isStripeConfigured: vi.fn(() => false),
  createSession: vi.fn(),
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

vi.mock("@/lib/services-catalog", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/services-catalog")>();
  return {
    ...actual,
    isPriceIdForCheckoutSlug: vi.fn(() => true),
  };
});

function postCheckout(body: Record<string, unknown>) {
  return POST(
    new Request("http://localhost/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

const validBody = {
  priceId: "price_test",
  service: "Nature Play Groups (Drop-In)",
  serviceSlug: "nature-play-dropin",
  parent: "Alex Parent",
  email: "parent@example.com",
  location: "outdoor",
};

describe("POST /api/checkout", () => {
  beforeEach(() => {
    stripeMocks.isStripeConfigured.mockReturnValue(false);
    stripeMocks.createSession.mockReset();
  });

  it("returns 503 when Stripe is not configured", async () => {
    const res = await postCheckout(validBody);
    expect(res.status).toBe(503);
    const data = (await res.json()) as { error?: string };
    expect(data.error).toMatch(/not configured/i);
  });

  it("rejects unknown checkout slugs", async () => {
    stripeMocks.isStripeConfigured.mockReturnValue(true);
    const res = await postCheckout({ ...validBody, serviceSlug: "not-a-real-slug" });
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error?: string };
    expect(data.error).toMatch(/unknown service/i);
  });

  it("rejects mismatched price ids for a slug", async () => {
    const { isPriceIdForCheckoutSlug } = await import("@/lib/services-catalog");
    vi.mocked(isPriceIdForCheckoutSlug).mockReturnValueOnce(false);
    stripeMocks.isStripeConfigured.mockReturnValue(true);

    const res = await postCheckout(validBody);
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error?: string };
    expect(data.error).toMatch(/price does not match/i);
  });

  it("requires a preferred format", async () => {
    stripeMocks.isStripeConfigured.mockReturnValue(true);
    const res = await postCheckout({ ...validBody, location: "" });
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error?: string };
    expect(data.error).toMatch(/preferred format/i);
  });

  it("creates a Stripe Checkout session when configured", async () => {
    stripeMocks.isStripeConfigured.mockReturnValue(true);
    stripeMocks.createSession.mockResolvedValue({
      url: "https://checkout.stripe.com/c/pay/cs_test_123",
    });

    const res = await postCheckout(validBody);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { url?: string };
    expect(data.url).toBe("https://checkout.stripe.com/c/pay/cs_test_123");

    expect(stripeMocks.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        line_items: [{ price: "price_test", quantity: 1 }],
        customer_email: "parent@example.com",
        success_url: "http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost:3000/checkout/cancel?service=nature-play-dropin",
        metadata: expect.objectContaining({
          checkout_slug: "nature-play-dropin",
          parent_name: "Alex Parent",
          preferred_location: "outdoor",
        }),
      }),
    );
  });
});
