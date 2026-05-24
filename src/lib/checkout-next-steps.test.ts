import { describe, expect, it } from "vitest";
import { checkoutSuccessNextSteps } from "@/lib/checkout-next-steps";

describe("checkoutSuccessNextSteps", () => {
  it("returns program-specific steps for known checkout slugs", () => {
    const reflexSteps = checkoutSuccessNextSteps("reflex");
    expect(reflexSteps.some((s) => /virtual onboarding/i.test(s))).toBe(true);

    const dropInSteps = checkoutSuccessNextSteps("nature-play-dropin");
    expect(dropInSteps.some((s) => /outdoor/i.test(s))).toBe(true);
  });

  it("falls back to generic steps for unknown slugs", () => {
    const steps = checkoutSuccessNextSteps("not-a-slug");
    expect(steps.some((s) => /confirmation email/i.test(s))).toBe(true);
  });

  it("falls back when slug is null", () => {
    expect(checkoutSuccessNextSteps(null).length).toBeGreaterThan(0);
  });
});
