import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { sampleWaitlistRows } from "@/lib/mock/admin-sample-data";
import { Card } from "@/components/ui/card";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Waitlist | Nature OT Growth OS",
};

export const dynamic = "force-dynamic";

export default async function AdminWaitlistPage() {
  await requireStaffPortal();
  type Row = {
    id: string;
    parent_name: string;
    parent_email: string;
    child_age_range: string;
    city_or_zip: string;
    preferred_schedule: string | null;
    status: string;
  };
  let rows: Row[] = [];

  try {
    const db = getAdminDb();
    const { data } = await db
      .from("waitlist_entries")
      .select(
        "id, parent_name, parent_email, child_age_range, city_or_zip, preferred_schedule, status"
      )
      .order("created_at", { ascending: false })
      .limit(100);
    rows = (data as Row[]) ?? [];
  } catch {
    rows = [];
  }

  const display =
    rows.length > 0
      ? rows
      : sampleWaitlistRows.map((r) => ({
          id: r.id,
          parent_name: r.parent,
          parent_email: "sample@example.com",
          child_age_range: r.ageRange,
          city_or_zip: `${r.city} · ${r.zip}`,
          preferred_schedule: r.schedule,
          status: r.status,
        }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-forest">
            Waitlist
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-bark/80">
            Operational overview — no clinical PHI. Sync to Airtable from{" "}
            <Link className="font-medium text-moss underline" href="/admin/airtable">
              Airtable sync
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary">
            Create group from demand
          </Button>
          <Button type="button" variant="outline">
            Match to existing group
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-bark/55">
            Age demand (sample)
          </p>
          <p className="mt-2 text-2xl font-semibold text-forest">5–7 peak</p>
          <p className="text-sm text-bark/75">After-school window</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-bark/55">
            ZIP clusters (sample)
          </p>
          <p className="mt-2 text-2xl font-semibold text-forest">786xx · 750xx</p>
          <p className="text-sm text-bark/75">Central TX / North DFW</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-bark/55">
            Interest themes
          </p>
          <p className="mt-2 text-sm text-bark/85">
            Regulation · motor confidence · outdoor confidence
          </p>
        </Card>
      </div>

      <ComplianceBanner>
        <p>
          Waitlist records should remain minimum-necessary and non-clinical. Use your HIPAA-aligned chart for treatment documentation.
        </p>
      </ComplianceBanner>

      <div className="overflow-x-auto rounded-2xl border border-sand bg-white shadow-sm">
        <table className="min-w-[860px] w-full text-left text-sm">
          <thead className="border-b border-sand bg-cream/60 text-forest">
            <tr>
              <th className="px-3 py-3 font-medium">Parent</th>
              <th className="px-3 py-3 font-medium">Email</th>
              <th className="px-3 py-3 font-medium">Age range</th>
              <th className="px-3 py-3 font-medium">City / ZIP</th>
              <th className="px-3 py-3 font-medium">Schedule</th>
              <th className="px-3 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {display.map((r) => (
              <tr key={r.id} className="border-t border-sand/70">
                <td className="px-3 py-3">{r.parent_name}</td>
                <td className="px-3 py-3">{r.parent_email}</td>
                <td className="px-3 py-3">{r.child_age_range}</td>
                <td className="px-3 py-3">{r.city_or_zip}</td>
                <td className="px-3 py-3">{r.preferred_schedule ?? "—"}</td>
                <td className="px-3 py-3">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
