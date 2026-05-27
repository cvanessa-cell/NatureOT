import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Content Studio | TreeTots Growth Engine",
};

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  title: string;
  asset_type: string;
  channel: string | null;
  status: string;
  compliance_status: string;
  scheduled_date: string | null;
};

export default async function MarketingContentPage() {
  await requireStaffPortal();
  const db = getAdminDb();

  const { data } = await db
    .from("content_assets")
    .select("id,title,asset_type,channel,status,compliance_status,scheduled_date")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (data as Row[] | null) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-forest">
            Content Studio
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-bark/80">
            Generate and manage content assets with compliance guardrails. High-risk phrases are flagged; approval is explicit.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/marketing/compliance">
            <Button type="button" variant="outline">
              Run compliance check
            </Button>
          </Link>
          <Link href="/admin/marketing/content/new">
            <Button type="button">New asset</Button>
          </Link>
        </div>
      </div>

      <Card>
        <p className="text-sm font-medium text-forest">Statuses</p>
        <p className="mt-2 text-sm text-bark/80">
          Idea → Draft → Needs review → Compliance review → Approved → Scheduled → Published.
        </p>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-sand bg-white shadow-sm">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="border-b border-sand bg-cream/60 text-forest">
            <tr>
              <th className="px-3 py-3 font-medium">Title</th>
              <th className="px-3 py-3 font-medium">Type</th>
              <th className="px-3 py-3 font-medium">Channel</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Compliance</th>
              <th className="px-3 py-3 font-medium">Scheduled</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-bark/70">
                  No content assets yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-sand/70">
                <td className="px-3 py-3 font-medium text-forest">{r.title}</td>
                <td className="px-3 py-3">{r.asset_type}</td>
                <td className="px-3 py-3">{r.channel ?? "—"}</td>
                <td className="px-3 py-3">
                  <Badge tone={r.status.includes("review") ? "warning" : "sage"}>{r.status}</Badge>
                </td>
                <td className="px-3 py-3">
                  <Badge
                    tone={
                      r.compliance_status === "approved"
                        ? "success"
                        : r.compliance_status === "high_risk" || r.compliance_status === "do_not_use"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {r.compliance_status}
                  </Badge>
                </td>
                <td className="px-3 py-3 tabular-nums">{r.scheduled_date ?? "—"}</td>
                <td className="px-3 py-3">
                  <Link href={`/admin/marketing/content/${r.id}`}>
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

