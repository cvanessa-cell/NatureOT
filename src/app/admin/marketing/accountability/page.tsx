import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Accountability | TreeTots Growth Engine",
};

export const dynamic = "force-dynamic";

type TaskRow = {
  id: string;
  title: string;
  category: string;
  due_date: string | null;
  status: string;
  priority: string;
};

export default async function MarketingAccountabilityPage() {
  await requireStaffPortal();
  const db = getAdminDb();

  const { data } = await db
    .from("accountability_tasks")
    .select("id,title,category,due_date,status,priority")
    .order("due_date", { ascending: true })
    .limit(100);

  const rows = (data as TaskRow[] | null) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-forest">
            Accountability Center
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-bark/80">
            Track launch schedule tasks, follow-ups, and weekly execution. Warnings surface when the system is drifting.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/marketing/accountability/new">
            <Button type="button">New task</Button>
          </Link>
          <Link href="/admin/marketing/metrics">
            <Button type="button" variant="outline">
              View metrics
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <p className="text-sm font-medium text-forest">Overdue checks (coming next)</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-bark/85">
          <li>No outreach completed this week</li>
          <li>No content scheduled this week</li>
          <li>Active campaign missing tracking/CTA</li>
          <li>Partner without next follow-up date</li>
        </ul>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-sand bg-white shadow-sm">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="border-b border-sand bg-cream/60 text-forest">
            <tr>
              <th className="px-3 py-3 font-medium">Task</th>
              <th className="px-3 py-3 font-medium">Category</th>
              <th className="px-3 py-3 font-medium">Due</th>
              <th className="px-3 py-3 font-medium">Priority</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-bark/70">
                  No accountability tasks yet. Create your launch plan tasks here.
                </td>
              </tr>
            )}
            {rows.map((t) => (
              <tr key={t.id} className="border-t border-sand/70">
                <td className="px-3 py-3 font-medium text-forest">{t.title}</td>
                <td className="px-3 py-3">{t.category}</td>
                <td className="px-3 py-3 tabular-nums">{t.due_date ?? "—"}</td>
                <td className="px-3 py-3">
                  <Badge tone={t.priority === "high" ? "warning" : "sage"}>{t.priority}</Badge>
                </td>
                <td className="px-3 py-3">
                  <Badge tone={t.status === "missed" ? "danger" : "sage"}>{t.status}</Badge>
                </td>
                <td className="px-3 py-3">
                  <Link href={`/admin/marketing/accountability/${t.id}`}>
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

