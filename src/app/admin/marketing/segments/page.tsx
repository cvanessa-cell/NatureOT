import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function MarketingSegmentsPage() {
  await requireStaffPortal();
  const db = getAdminDb();
  const { data: segments } = await db.from("lead_segments").select("id,name,description,rules");

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">Lead segments</h1>
      {(segments ?? []).map((segment) => (
        <Card key={segment.id}>
          <p className="font-medium text-forest">{segment.name}</p>
          <p className="text-sm text-bark/80">{segment.description ?? "No description"}</p>
          <pre className="mt-2 overflow-x-auto rounded bg-cream/60 p-2 text-xs">{JSON.stringify(segment.rules, null, 2)}</pre>
        </Card>
      ))}
    </div>
  );
}
