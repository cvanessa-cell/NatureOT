import { describe, expect, it } from "vitest";
import { SERVICES_CATALOG } from "@/lib/services-catalog";
import {
  lowestCheckoutPrice,
  pricePerSessionLabel,
  priceSavingsHint,
} from "@/lib/services-pricing";

describe("services-pricing", () => {
  it("exposes checkout links for every catalog price", () => {
    for (const service of SERVICES_CATALOG) {
      for (const price of service.prices) {
        expect(price.checkoutSlug, `${service.key} ${price.label}`).toBeTruthy();
      }
    }
  });

  it("computes pass savings hints", () => {
    const naturePlay = SERVICES_CATALOG.find((s) => s.key === "nature-play")!;
    const pass = naturePlay.prices.find((p) => p.checkoutSlug === "nature-play-pass")!;
    expect(priceSavingsHint("nature-play", pass)).toContain("Save");
    expect(pricePerSessionLabel(pass)).toContain("/session");
  });

  it("reports lowest checkout price per service", () => {
    expect(lowestCheckoutPrice(SERVICES_CATALOG[0])).toBe(35);
    expect(lowestCheckoutPrice(SERVICES_CATALOG[2])).toBe(497);
  });
});
