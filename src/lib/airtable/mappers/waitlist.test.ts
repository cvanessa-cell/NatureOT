import { describe, expect, it } from "vitest";
import { mapWaitlistRowToAirtable } from "./waitlist";

describe("mapWaitlistRowToAirtable", () => {
  it("uses Airtable column titles from Waitlist Entries table", () => {
    const fields = mapWaitlistRowToAirtable({
      id: "5a202917-75fe-4957-a08d-3b36f34b3d6a",
      parent_email: "parent@example.com",
      parent_name: "Caitlyn Vanessa",
      child_age_range: "5–7",
      city_or_zip: "Austin 78701",
      preferred_schedule: "Mon/Wed mornings",
      interest_areas: ["Sensory regulation"],
      status: "active",
      general_notes: null,
      consent_marketing: true,
      consent_waitlist: true,
    });

    expect(fields["Parent First Name"]).toBe("Caitlyn Vanessa");
    expect(fields["Parent Email"]).toBe("parent@example.com");
    expect(fields.City).toBe("Austin");
    expect(fields.ZIP).toBe("78701");
    expect(fields["General Interest Areas"]).toBe("Sensory regulation");
    expect(fields["Consent Logged"]).toBe(true);
    expect(fields.Status).toBe("Waitlisted");
    expect((fields as Record<string, unknown>)["Supabase ID"]).toBeUndefined();
  });
});
