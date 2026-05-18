import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import { Card } from "@/components/ui/card";
import { LinkBuilderClient } from "@/components/admin/marketing/link-builder-client";

export const dynamic = "force-dynamic";

export default async function MarketingLinkBuilderPage() {
  await requireStaffPortal();
  const db = getAdminDb();
  const { data } = await db.from("marketing_campaigns").select("id,name,slug,status").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-forest">Campaign link builder</h1>
      <Card>
        <p className="text-sm text-bark/80">Create trackable UTM links for campaigns and copy the generated URL.</p>
      </Card>
      <LinkBuilderClient campaigns={(data ?? []) as Array<{ id: string; name: string; slug: string; status: string }>} />
    </div>
  );
}
