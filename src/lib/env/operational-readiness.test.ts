import { describe, expect, it } from "vitest";
import { getOperationalReadinessSections } from "./operational-readiness";

describe("getOperationalReadinessSections", () => {
  it("returns structured infra + compliance checkpoints", () => {
    const s = getOperationalReadinessSections();
    expect(s.infrastructure.length).toBeGreaterThan(0);
    expect(s.complianceSafety.length).toBeGreaterThan(0);
    expect(s.launchContent.length).toBeGreaterThan(0);
  });

  it("flags core CTA pages for manual QA with e2e script hint", () => {
    const launch = getOperationalReadinessSections().launchContent;
    const labels = launch.map((r) => r.label);
    expect(labels.some((l) => l.includes("/book-call") && l.includes("manual QA"))).toBe(
      true,
    );
    expect(labels.some((l) => l.includes("/provider-referral"))).toBe(true);
    expect(
      launch.find((r) => r.id === "bookCall")?.detail?.includes("e2e:cta-routes"),
    ).toBe(true);
  });

  it("mentions Airtable mapper, retry endpoint, cron, signed URL knobs, Zapier posture, campaign authenticity guardrails", () => {
    const ids = [
      ...getOperationalReadinessSections().infrastructure.map((r) => r.id),
      ...getOperationalReadinessSections().complianceSafety.map((r) => r.id),
    ];
    expect(ids).toEqual(
      expect.arrayContaining([
        "airtableFieldMapper",
        "airtableRetryApi",
        "airtableCronSecret",
        "airtableCronLimit",
        "guide",
        "zapier",
        "campaignAuthenticity",
      ])
    );
  });
});
