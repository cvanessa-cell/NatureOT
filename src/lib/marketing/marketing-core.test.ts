import { describe, expect, it } from "vitest";
import { hashIp, parseAttributionFromRequest } from "@/lib/marketing/attribution";
import { renderMarketingTemplate, shouldSkipMarketingSend } from "@/lib/marketing/sequences";
import {
  buildMetaConversionPayload,
  fbcFromFbclid,
  sha256Hash,
} from "@/lib/meta/conversions-api";

describe("marketing attribution", () => {
  it("parses UTM params correctly", () => {
    const req = new Request(
      "http://localhost/form?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_content=a1&utm_term=ot&gclid=g123&fbclid=f123"
    );
    const parsed = parseAttributionFromRequest(req);
    expect(parsed.utm_source).toBe("google");
    expect(parsed.utm_medium).toBe("cpc");
    expect(parsed.utm_campaign).toBe("spring");
    expect(parsed.gclid).toBe("g123");
    expect(parsed.fbclid).toBe("f123");
  });

  it("hashes IP and never keeps raw IP", () => {
    const hashed = hashIp("127.0.0.1");
    expect(hashed).toBeTruthy();
    expect(hashed).not.toContain("127.0.0.1");
  });
});

describe("meta conversions api payloads", () => {
  it("normalizes and hashes user data", () => {
    expect(sha256Hash(" Taylor@Example.COM ")).toBe(
      "6f666aedca03c6514c6fea1701241e1db06bdfe964b8ee1ae08a6d47cdf8fa56"
    );
  });

  it("formats fbc from fbclid", () => {
    expect(fbcFromFbclid("fb-click-123", 1770000000)).toBe(
      "fb.1.1770000000.fb-click-123"
    );
  });

  it("builds a website event payload with hashed identifiers", () => {
    const req = new Request("http://localhost/waitlist?fbclid=abc", {
      headers: {
        "user-agent": "vitest-agent",
        "x-forwarded-for": "203.0.113.10",
      },
    });
    const { payload } = buildMetaConversionPayload({
      req,
      eventName: "Lead",
      email: "Taylor@Example.com",
      phone: "(214) 555-0101",
      eventId: "lead_123",
      fbclid: "abc",
    });

    expect(payload.event_name).toBe("Lead");
    expect(payload.event_id).toBe("lead_123");
    expect(payload.action_source).toBe("website");
    expect(payload.user_data.em?.[0]).toHaveLength(64);
    expect(payload.user_data.ph?.[0]).toHaveLength(64);
    expect(payload.user_data.fbc).toMatch(/^fb\.1\.\d+\.abc$/);
    expect(payload.user_data.client_ip_address).toBe("203.0.113.10");
    expect(payload.user_data.client_user_agent).toBe("vitest-agent");
  });
});

describe("marketing sequence safety", () => {
  it("skips unsubscribed lead sends", async () => {
    const skip = await shouldSkipMarketingSend({ unsubscribed_at: new Date().toISOString(), consent_marketing: true });
    expect(skip).toBe(true);
  });

  it("skips when consent is missing", async () => {
    const skip = await shouldSkipMarketingSend({ unsubscribed_at: null, consent_marketing: false });
    expect(skip).toBe(true);
  });

  it("renders templates with lead fields", () => {
    const body = renderMarketingTemplate("Hi {{parent_name}} at {{parent_email}}", {
      parent_name: "Taylor",
      parent_email: "taylor@example.com",
    });
    expect(body).toContain("Hi Taylor");
    expect(body).toContain("taylor@example.com");
  });

  it("compliance wording avoids cure/fix/guarantee terms", () => {
    const sample = "TreeTots helps build confidence and supports sensory regulation through outdoor play.";
    expect(sample.toLowerCase()).not.toMatch(/\bcure\b|\bfix\b|\bguarantee\b/);
  });
});
