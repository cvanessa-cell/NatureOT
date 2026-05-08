import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Campaigns | TreeTots Growth Engine",
};

export const dynamic = "force-dynamic";

type CampaignRow = {
  id: string;
  name: string;
  type: string;
  audience: string | null;
  status: string;
  start_date: string | null;
};

type CampaignTemplateRow = {
  id: string;
  key: string;
  name: string;
};

export default async function MarketingCampaignsPage() {
  await requireStaffPortal();
  const db = getAdminDb();

  const [{ data: templates }, { data: rows }] = await Promise.all([
    db.from("campaign_templates").select("id,key,name").order("name", { ascending: true }).limit(50),
    db.from("campaigns").select("id,name,type,audience,status,start_date").order("created_at", { ascending: false }).limit(100),
  ]);

  const campaignRows = (rows as CampaignRow[] | null) ?? [];
  const templateRows = (templates as CampaignTemplateRow[] | null) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
            Campaign planner
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-bark/80">
            Create campaigns from templates, track KPI targets vs actuals, and connect assets, landing pages, and outreach tasks.
          </p>
        </div>
        <Link href="/admin/marketing/campaigns/new">
          <Button type="button">New campaign</Button>
        </Link>
      </div>

      <Card>
        <p className="text-sm font-medium text-forest">Templates</p>
        <p className="mt-2 text-sm text-bark/80">
          Start fast with a strategy template. (Creation UI is the next step; templates are already seeded in Supabase.)
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {templateRows.slice(0, 12).map((t) => (
            <li key={t.id} className="rounded-full border border-sand bg-cream/50 px-3 py-1 text-xs font-medium text-bark">
              {t.name}
            </li>
          ))}
        </ul>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-sand bg-white shadow-sm">
        <table className="min-w-[880px] w-full text-left text-sm">
          <thead className="border-b border-sand bg-cream/60 text-forest">
            <tr>
              <th className="px-3 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Type</th>
              <th className="px-3 py-3 font-medium">Audience</th>
              <th className="px-3 py-3 font-medium">Start</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaignRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-bark/70">
                  No campaigns yet. Create one from a template.
                </td>
              </tr>
            )}
            {campaignRows.map((c) => (
              <tr key={c.id} className="border-t border-sand/70">
                <td className="px-3 py-3 font-medium text-forest">{c.name}</td>
                <td className="px-3 py-3">{c.type}</td>
                <td className="px-3 py-3">{c.audience ?? "—"}</td>
                <td className="px-3 py-3 tabular-nums">{c.start_date ?? "—"}</td>
                <td className="px-3 py-3">
                  <Badge tone={c.status === "active" ? "success" : "sage"}>{c.status}</Badge>
                </td>
                <td className="px-3 py-3">
                  <Link href={`/admin/marketing/campaigns/${c.id}`}>
                    <Button type="button" variant="outline" className="!min-h-9 !px-3 !py-1 !text-xs">
                      Open
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

