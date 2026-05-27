import { describe, expect, it } from "vitest";
import { parentGuideLeadEmailHtml } from "./email-templates";

describe("parentGuideLeadEmailHtml", () => {
  it("points families to /api/parent-guide-download proxy", () => {
    const html = parentGuideLeadEmailHtml({ parentName: "Taylor" });
    expect(html).toContain("/api/parent-guide-download");
    expect(html).not.toContain('href="http://localhost:3000/parent-guide"');
  });
});
