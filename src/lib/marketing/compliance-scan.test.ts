import { describe, expect, it } from "vitest";
import { scanMarketingCopy, slugifyMarketingCampaign } from "./compliance-scan";

describe("scanMarketingCopy", () => {
  it("flags diagnosis-targeting language as high risk", () => {
    const result = scanMarketingCopy("If your child has sensory needs, call us today.");
    expect(result.riskLevel).toBe("high_risk");
    expect(result.flaggedTerms.length).toBeGreaterThan(0);
  });

  it("approves neutral educational copy", () => {
    const result = scanMarketingCopy(
      "TreeTots offers small outdoor groups that support regulation and participation practice."
    );
    expect(result.riskLevel).toBe("approved");
  });
});

describe("slugifyMarketingCampaign", () => {
  it("creates a url-safe slug", () => {
    expect(slugifyMarketingCampaign("Parent Guide — DFW")).toBe("parent-guide-dfw");
  });
});
