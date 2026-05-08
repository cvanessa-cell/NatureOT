import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  stripUnsafeZapierPayload,
  isBlockedZapierKey,
} from "./zapier-safety-filter";
import { extractInboundZapierSecret } from "./zapier-inbound";
import {
  mapContentSchedulingPayload,
  mapLeadCreatedPayload,
  mapTestimonialOutboundPayload,
} from "./zapier-payload-mapper";

describe("Zapier safety filter", () => {
  it("removes PHI-like nested keys including child DOB variants", () => {
    const { data, strippedKeys } = stripUnsafeZapierPayload({
      parent_email: "a@b.com",
      child_full_dob: "2018-01-01",
      diagnosis_summary: "example",
      safe_field: "ok",
    });
    expect(data.child_full_dob).toBeUndefined();
    expect(data.diagnosis_summary).toBeUndefined();
    expect(data.parent_email).toBe("a@b.com");
    expect(strippedKeys.length).toBeGreaterThan(0);
  });

  it("flags main_concern / clinical fields as blocked keys", () => {
    expect(isBlockedZapierKey("main_concern")).toBe(true);
    expect(isBlockedZapierKey("parent_email")).toBe(false);
  });
});

describe("Inbound webhook secret", () => {
  const prev = { ...process.env };

  beforeEach(() => {
    process.env = { ...prev, ZAPIER_WEBHOOK_SECRET: "unit-test-secret" };
  });

  afterEach(() => {
    process.env = { ...prev };
  });

  it("extracts secret from x-zapier-secret or Authorization bearer", () => {
    const a = new Request("https://example.com/hook", {
      headers: { "x-zapier-secret": "unit-test-secret" },
    });
    expect(extractInboundZapierSecret(a)).toBe("unit-test-secret");

    const b = new Request("https://example.com/hook", {
      headers: { Authorization: "Bearer unit-test-secret" },
    });
    expect(extractInboundZapierSecret(b)).toBe("unit-test-secret");
  });

  it("rejects when secret missing or wrong", async () => {
    const { assertZapierWebhookSecret } = await import("./zapier-inbound");
    const bad = new Request("https://example.com/hook", {
      headers: { "x-zapier-secret": "nope" },
    });
    const r = assertZapierWebhookSecret(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(401);
  });
});

describe("Payload mappers & approval gates", () => {
  it("strips quiz / concern data from lead mapper (not forwarded to Zapier)", () => {
    const m = mapLeadCreatedPayload({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      parent_email: "p@example.com",
      parent_name: "Pat",
      child_age_range: "4–5",
      city_or_zip: "78701",
    });
    expect(m.data.main_concern).toBeUndefined();
    expect(m.data.parent_email).toBe("p@example.com");
  });

  it("blocks content scheduling unless status is approved", () => {
    const draft = mapContentSchedulingPayload({
      id: "10101010-1010-1010-1010-101010101010",
      title: "Draft",
      status: "draft",
      channel: "instagram",
    });
    expect(draft.ok).toBe(false);
    if (!draft.ok) expect(draft.reason).toMatch(/approved/i);
  });

  it("blocks testimonial payloads without authorization linkage", () => {
    const t = mapTestimonialOutboundPayload({
      id: "20202020-2020-2020-2020-202020202020",
      quote: "Great!",
      status: "pending",
      publish_allowed: true,
    });
    expect(t.ok).toBe(false);
  });
});
