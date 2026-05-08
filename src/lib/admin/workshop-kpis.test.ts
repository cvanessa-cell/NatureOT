import { describe, expect, it } from "vitest";
import {
  enrolledCaption,
  practiceWideBookings,
  waitlistAddsFromWorkshopCaption,
} from "./workshop-kpis";

describe("workshop KPI helpers", () => {
  it("labels missing booking bridge honestly", () => {
    expect(practiceWideBookings(null).value).toBe("—");
    expect(practiceWideBookings(null).caption.toLowerCase()).toContain("not connected");
  });

  it("keeps unattributed integrations explicit", () => {
    expect(waitlistAddsFromWorkshopCaption().caption.toLowerCase()).toContain("await");
    expect(enrolledCaption().caption.toLowerCase()).toContain("await");
    expect(practiceWideBookings(5).caption.toLowerCase()).toContain("not attributed");
  });
});
