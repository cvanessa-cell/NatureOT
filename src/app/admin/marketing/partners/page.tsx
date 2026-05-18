import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Partners | TreeTots Growth Engine",
};

export const dynamic = "force-dynamic";

type OrgRow = {
  id: string;
  name: string;
  category: string;
  city: string | null;
  status: string;
  priority_score: number;
  next_follow_up_at: string | null;
  permission_to_contact: boolean;
};

export default async function MarketingPartnersPage() {
  await requireStaffPortal();

  const db = getAdminDb();
  const { data } = await db
    .from("organizations")
    .select("id,name,category,city,status,priority_score,next_follow_up_at,permission_to_contact")
    .order("priority_score", { ascending: false })
    .limit(100);

  const rows = (data as OrgRow[] | null) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-forest">
            Partner CRM + Market Map
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-bark/80">
            Curate organizations across DFW, score priority, and track outreach without automating DMs or mass unsolicited posting.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/marketing/partners/import">
            <Button type="button" variant="outline">
              Import CSV
            </Button>
          </Link>
          <Link href="/admin/marketing/partners/new">
            <Button type="button">New organization</Button>
          </Link>
        </div>
      </div>

      <Card>
        <p className="text-sm font-medium text-forest">Scoring logic</p>
        <p className="mt-2 text-sm text-bark/80">
          Combined priority score is computed as \(0.35·relevance + 0.20·proximity + 0.25·referral\_likelihood + 0.20·relationship\_priority\).
        </p>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-sand bg-white shadow-sm">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="border-b border-sand bg-cream/60 text-forest">
            <tr>
              <th className="px-3 py-3 font-medium">Organization</th>
              <th className="px-3 py-3 font-medium">Category</th>
              <th className="px-3 py-3 font-medium">City</th>
              <th className="px-3 py-3 font-medium">Priority</th>
              <th className="px-3 py-3 font-medium">Follow-up</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Permission</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-bark/70">
                  No organizations yet. Import a CSV to get started.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-sand/70">
                <td className="px-3 py-3 font-medium text-forest">{r.name}</td>
                <td className="px-3 py-3">{r.category}</td>
                <td className="px-3 py-3">{r.city ?? "—"}</td>
                <td className="px-3 py-3 tabular-nums">{Number(r.priority_score ?? 0).toFixed(1)}</td>
                <td className="px-3 py-3 text-xs text-bark/70 tabular-nums">
                  {r.next_follow_up_at ? new Date(r.next_follow_up_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-3 py-3">
                  <Badge tone={r.status.includes("due") ? "warning" : "sage"}>{r.status}</Badge>
                </td>
                <td className="px-3 py-3">
                  <Badge tone={r.permission_to_contact ? "success" : "warning"}>
                    {r.permission_to_contact ? "ok" : "unknown"}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/marketing/partners/${r.id}`}>
                      <Button type="button" variant="outline" className="!min-h-9 !px-3 !py-1 !text-xs">
                        Open
                      </Button>
                    </Link>
                    <Link href={`/admin/marketing/partners/${r.id}/next`}>
                      <Button type="button" variant="ghost" className="!min-h-9 !px-3 !py-1 !text-xs">
                        Next action
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

