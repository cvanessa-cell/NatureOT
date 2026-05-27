import { describe, expect, it } from "vitest";
import { SERVICES_CATALOG } from "@/lib/services-catalog";
import {
  checkoutSavingsHint,
  lowestCheckoutPrice,
  pricePerSessionLabel,
  priceSavingsHint,
} from "@/lib/services-pricing";
import {
  isPriceIdForCheckoutSlug,
  servicesPageAnchorForCheckoutSlug,
} from "@/lib/services-catalog";

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

  it("maps checkout slugs to services page anchors", () => {
    expect(servicesPageAnchorForCheckoutSlug("nature-play-pass")).toBe("nature-play");
    expect(servicesPageAnchorForCheckoutSlug("ot-group-series")).toBe("ot-group");
    expect(servicesPageAnchorForCheckoutSlug("reflex")).toBe("reflex-intensive");
  });

  it("exposes pass savings on checkout slug lookup", () => {
    expect(checkoutSavingsHint("nature-play-pass")).toContain("Save");
    expect(checkoutSavingsHint("nature-play-dropin")).toBeNull();
  });

  it("validates price id only when env price is set", () => {
    const option = SERVICES_CATALOG[0].prices[0];
    if (!option.checkoutSlug) return;
    expect(isPriceIdForCheckoutSlug(option.checkoutSlug, "price_wrong")).toBe(false);
  });
});
