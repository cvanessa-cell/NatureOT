import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LinkBuilderClient } from "@/components/admin/marketing/link-builder-client";
import { listCampaignsForLinkBuilder } from "@/lib/marketing/link-campaigns";

export const dynamic = "force-dynamic";

export default async function MarketingLinkBuilderPage() {
  await requireStaffPortal();
  const db = getAdminDb();
  const campaigns = await listCampaignsForLinkBuilder(db);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-forest">Campaign link builder</h1>
      <Card>
        <p className="text-sm text-bark/80">
          Create trackable UTM links for campaigns and copy the generated URL. Planner campaigns synced from{" "}
          <Link href="/admin/marketing/campaigns/new" className="font-semibold text-moss underline">
            New campaign
          </Link>{" "}
          appear in <code className="rounded bg-cream px-1">marketing_campaigns</code> automatically.
        </p>
      </Card>
      <LinkBuilderClient campaigns={campaigns} />
    </div>
  );
}
