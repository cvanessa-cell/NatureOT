import type { SupabaseClient } from "@supabase/supabase-js";

export type LinkCampaignOption = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

/** UTM link builder uses marketing_campaigns; fall back to planner campaigns when needed. */
export async function listCampaignsForLinkBuilder(
  db: SupabaseClient
): Promise<LinkCampaignOption[]> {
  const { data: marketing } = await db
    .from("marketing_campaigns")
    .select("id,name,slug,status")
    .order("created_at", { ascending: false });

  if (marketing && marketing.length > 0) {
    return marketing as LinkCampaignOption[];
  }

  const { data: planner } = await db
    .from("campaigns")
    .select("id,name,status")
    .order("created_at", { ascending: false })
    .limit(100);

  return (planner ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    slug: String(row.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72),
    status: (row.status as string) ?? "planned",
  }));
}
