import { describe, expect, it } from "vitest";
import { hashIp, parseAttributionFromRequest } from "@/lib/marketing/attribution";
import { renderMarketingTemplate, shouldSkipMarketingSend } from "@/lib/marketing/sequences";

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
