import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CampaignCreator } from "@/components/admin/marketing/campaign-creator";

export const metadata: Metadata = {
  title: "New campaign | TreeTots Growth Engine",
};

export const dynamic = "force-dynamic";

type TemplateRow = { id: string; name: string; key: string };

export default async function NewCampaignPage() {
  await requireStaffPortal();
  const db = getAdminDb();

  const { data } = await db.from("campaign_templates").select("id,name,key").order("name", { ascending: true });
  const templates = (data as TemplateRow[] | null) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">
          New campaign
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-bark/80">
          Start from a template to get the recommended goals, benchmarks, and workflow checklist.
        </p>
      </div>

      <Card>
        <p className="text-sm font-medium text-forest">Create from template</p>
        <p className="mt-2 text-sm text-bark/80">
          This creates a campaign record from a strategy template. You can then attach partners, assets, landing pages, and tasks.
        </p>
        <div className="mt-6">
          <CampaignCreator templates={templates} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/marketing/campaigns">
            <Button type="button" variant="outline">
              Back to campaigns
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

