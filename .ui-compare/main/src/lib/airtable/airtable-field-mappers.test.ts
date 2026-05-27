import { describe, expect, it } from "vitest";
import {
  SUPPORTED_AIRTABLE_MAPPING_TARGETS,
  hasAirtableFieldMapperForTarget,
  mapInternalPayloadToAirtableFields,
  normalizeAirtableTargetKey,
} from "./airtable-field-mappers";

describe("airtable-field-mappers", () => {
  it("normalizes enqueue labels consistently", () => {
    expect(normalizeAirtableTargetKey("Leads")).toBe("leads");
    expect(normalizeAirtableTargetKey("Workshops")).toBe("workshop registrations");
  });

  it("declares an explicit whitelist map for each supported Growth OS queue target", () => {
    for (const t of SUPPORTED_AIRTABLE_MAPPING_TARGETS) {
      expect(hasAirtableFieldMapperForTarget(t)).toBe(true);
      const mapped = mapInternalPayloadToAirtableFields(t, {
        noop_should_drop: true,
      });
      expect(mapped.ok).toBe(true);
      if (mapped.ok) expect(mapped.droppedKeys).toContain("noop_should_drop");
    }
  });

  it("maps the marketing lead snapshot example", () => {
    const mapped = mapInternalPayloadToAirtableFields("leads", {
      parent_first_name: "Caitlyn",
      email: "test@example.com",
      city: "Austin",
      zip: "78701",
      child_age_range: "5–7",
      general_interest_areas: ["Sensory regulation", "Motor confidence"],
    });
    expect(mapped.ok).toBe(true);
    if (!mapped.ok) throw new Error("expected ok");
    expect(mapped.fields["Parent First Name"]).toBe("Caitlyn");
    expect(mapped.fields.Email).toBe("test@example.com");
    expect(mapped.fields.City).toBe("Austin");
    expect(mapped.fields.ZIP).toBe("78701");
    expect(mapped.fields["Child Age Range"]).toBe("5–7");
    expect(mapped.fields["General Interest Areas"]).toBe("Sensory regulation, Motor confidence");
  });

  it("drops unknown internal keys instead of leaking snake_case titles", () => {
    const mapped = mapInternalPayloadToAirtableFields("leads", {
      parent_email: "p@example.com",
      rogue_field_xyz: "nope",
    });
    expect(mapped.ok).toBe(true);
    if (!mapped.ok) throw new Error("expected ok");
    expect(mapped.fields["Email"]).toBe("p@example.com");
    expect((mapped.fields as Record<string, unknown>).rogue_field_xyz).toBeUndefined();
    expect(mapped.droppedKeys).toContain("rogue_field_xyz");
  });

  it("blocks PHI-like internals even if mistakenly present post-strip", () => {
    const mapped = mapInternalPayloadToAirtableFields("leads", {
      parent_email: "p@example.com",
      diagnosis: "hidden",
      medical_history: "hidden",
      _stripped_blocked_keys: ["should-never-send"],
    });
    expect(mapped.ok).toBe(true);
    if (!mapped.ok) throw new Error("expected ok");
    expect(Object.keys(mapped.fields).some((k) => k.toLowerCase().includes("diagnosis"))).toBe(false);
    expect((mapped.fields as Record<string, unknown>)._stripped_blocked_keys).toBeUndefined();
  });

  it("returns a stable error envelope when no mapper exists", () => {
    const mapped = mapInternalPayloadToAirtableFields("mystery table", {});
    expect(mapped.ok).toBe(false);
    if (mapped.ok) throw new Error("expected fail");
    expect(mapped.error).toContain("no_airtable_field_mapper_for_target");
  });
});
