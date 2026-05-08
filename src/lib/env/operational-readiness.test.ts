import { describe, expect, it } from "vitest";
import { getOperationalReadinessSections } from "./operational-readiness";

describe("getOperationalReadinessSections", () => {
  it("returns structured infra + compliance checkpoints", () => {
    const s = getOperationalReadinessSections();
    expect(s.infrastructure.length).toBeGreaterThan(0);
    expect(s.complianceSafety.length).toBeGreaterThan(0);
    expect(s.launchContent.length).toBeGreaterThan(0);
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
