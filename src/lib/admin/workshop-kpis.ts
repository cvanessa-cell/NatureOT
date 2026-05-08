/** Honest captions for workshop dashboard metrics lacking CRM attribution. */

export function practiceWideBookings(count: number | null): {
  value: string;
  caption: string;
} {
  if (count === null) {
    return { value: "—", caption: "Not connected yet (no bookings query)." };
  }
  return {
    value: String(count),
    caption:
      "Practice-wide bookings captured in Growth OS — not attributed per workshop cohort until scheduler metadata links land.",
  };
}

export function waitlistAddsFromWorkshopCaption(): {
  value: string;
  caption: string;
} {
  return {
    value: "—",
    caption: "Awaiting waitlist/workshop tagging integration — avoid inventing percentages.",
  };
}

export function enrolledCaption(): { value: string; caption: string } {
  return {
    value: "—",
    caption: "Awaiting enrollment onboarding integration — revenue/enrolled counts stay blank.",
  };
}
