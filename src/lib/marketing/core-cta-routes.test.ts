import { describe, expect, it } from "vitest";
import {
  CORE_CTA_MANUAL_QA_PAGES,
  LAUNCH_CONTENT_MANUAL_QA_PAGES,
} from "./core-cta-routes";

describe("core CTA routes", () => {
  it("lists revenue intake pages for launch manual QA", () => {
    const ids = CORE_CTA_MANUAL_QA_PAGES.map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining(["home", "bookCall", "waitlist", "providerReferral"]),
    );
  });

  it("defines HTML markers for each core route", () => {
    for (const page of CORE_CTA_MANUAL_QA_PAGES) {
      expect(page.markers.length).toBeGreaterThan(0);
      expect(page.path.startsWith("/")).toBe(true);
    }
  });

  it("keeps supplemental launch pages separate from core CTAs", () => {
    expect(LAUNCH_CONTENT_MANUAL_QA_PAGES.map((p) => p.id)).toEqual(
      expect.arrayContaining(["groups", "guidePage", "workshops", "referrals"]),
    );
  });
});
