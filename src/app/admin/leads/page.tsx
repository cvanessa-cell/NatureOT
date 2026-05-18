import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import { sampleLeads } from "@/lib/mock/admin-sample-data";
import { LeadsTable, type LeadRow } from "@/components/admin/leads-table";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Leads | Nature OT Growth OS",
};

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  await requireStaffPortal();
  let rows: LeadRow[] = sampleLeads as LeadRow[];

  try {
    const db = getAdminDb();
    const { data } = await db
      .from("leads")
      .select(
        "id, parent_name, parent_email, city_or_zip, created_at, primary_result_category, lead_source, form_type"
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (data && data.length > 0) {
      rows = data.map((r) => ({
        id: r.id as string,
        name: (r.parent_name as string) ?? "",
        email: (r.parent_email as string) ?? "",
        city: ((r.city_or_zip as string) ?? "").trim() || "—",
        source:
          ((r.lead_source as string) ?? "").trim() ||
          ((r.form_type as string) ?? "").trim() ||
          "Growth OS",
        status: "active",
        interest: (r.primary_result_category as string) ?? "—",
        booking: "unknown",
        created: r.created_at as string,
      }));
    }
  } catch {
    /* sample */
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-forest">
          Leads
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-bark/80">
          Search and triage marketing-qualified leads. Tie actions to consent and your operational policy.
        </p>
      </div>
      <Card className="border-sand/80">
        <LeadsTable rows={rows} />
      </Card>
    </div>
  );
}
