import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Read-only / preview command handlers for the Agent_Airtable command center.
 *
 * When integrating Agent_Airtable MCP (user-airtable) from Cursor, implement parallel
 * paths that call MCP tools with the SAME filtered payloads — never add PHI fields.
 *
 * Example MCP mapping (conceptual):
 *   listRecords(baseId, waitlistTableId, filterByFormula: ...)
 */

export type CommandPreview =
  | { kind: "table"; title: string; rows: Record<string, unknown>[] }
  | { kind: "summary"; title: string; bullets: string[] }
  | { kind: "error"; message: string };

export async function runPreviewCommand(
  commandKey: string,
  _payload: Record<string, unknown>
): Promise<{ preview: CommandPreview; proposedWrites: unknown | null }> {
  const db = createAdminClient();

  switch (commandKey) {
    case "waitlist_demand_by_age": {
      const { data } = await db.from("waitlist_entries").select("child_age_range");
      const counts: Record<string, number> = {};
      for (const r of data ?? []) {
        const k = (r as { child_age_range: string }).child_age_range;
        counts[k] = (counts[k] ?? 0) + 1;
      }
      return {
        preview: {
          kind: "summary",
          title: "Waitlist demand by child age range",
          bullets: Object.entries(counts).map(([k, v]) => `${k}: ${v} families`),
        },
        proposedWrites: null,
      };
    }
    case "waitlist_demand_by_zip": {
      const { data } = await db.from("waitlist_entries").select("city_or_zip");
      const counts: Record<string, number> = {};
      for (const r of data ?? []) {
        const k = (r as { city_or_zip: string }).city_or_zip;
        counts[k] = (counts[k] ?? 0) + 1;
      }
      const top = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
      return {
        preview: {
          kind: "table",
          title: "Top ZIP / city interest (non-clinical)",
          rows: top.map(([city_or_zip, count]) => ({ city_or_zip, count })),
        },
        proposedWrites: null,
      };
    }
    case "referral_partner_activity_month": {
      const { data } = await db
        .from("referral_interactions")
        .select("id, occurred_at, interaction_type, referral_partner_id")
        .order("occurred_at", { ascending: false })
        .limit(50);
      return {
        preview: {
          kind: "table",
          title: "Recent partner interactions (operational)",
          rows: (data ?? []) as Record<string, unknown>[],
        },
        proposedWrites: null,
      };
    }
    case "seo_pages_pending_review": {
      const { data } = await db
        .from("landing_pages")
        .select("id, slug, city, status")
        .in("status", ["generated", "planned"])
        .limit(30);
      return {
        preview: {
          kind: "table",
          title: "SEO landing pages not fully approved",
          rows: (data ?? []) as Record<string, unknown>[],
        },
        proposedWrites: null,
      };
    }
    default:
      return {
        preview: {
          kind: "error",
          message: `Unknown command: ${commandKey}`,
        },
        proposedWrites: null,
      };
  }
}
