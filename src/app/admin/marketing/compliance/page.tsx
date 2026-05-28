import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ComplianceScanner } from "@/components/admin/marketing/compliance-scanner";

export const metadata: Metadata = {
  title: "Compliance | TreeTots Growth Engine",
};

export const dynamic = "force-dynamic";

export default async function MarketingCompliancePage() {
  await requireStaffPortal();
  const db = getAdminDb();

  const { data } = await db
    .from("compliance_reviews")
    .select("id,risk_level,approved,flagged_terms,created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">Compliance review</h1>
        <p className="mt-2 max-w-3xl text-sm text-bark/80">
          Scan content for diagnosis-targeting language, guarantees, and unsafe claims. Store review decisions with notes.
        </p>
      </div>

      <Card>
        <p className="text-sm font-medium text-forest">Quick rules</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-bark/85">
          <li>No “your child has…” or diagnosis-targeting language.</li>
          <li>No cure/fix/guarantee claims. Avoid before/after outcomes.</li>
          <li>No automated social DMs or group posting.</li>
          <li>Marketing forms should be minimum-necessary; no PHI required.</li>
        </ul>
      </Card>

      <Card>
        <p className="text-sm font-medium text-forest">Compliance scanner</p>
        <p className="mt-2 text-sm text-bark/80">
          Paste copy → scan → review flagged phrases → save an approval decision to Supabase.
        </p>
        <div className="mt-4">
          <ComplianceScanner />
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-forest">Recent reviews</p>
        <ul className="mt-3 space-y-2 text-sm text-bark/85">
          {(data ?? []).length === 0 && <li>No reviews stored yet.</li>}
          {(data ?? []).map((r) => (
            <li key={r.id} className="rounded-lg border border-sand/70 bg-white/70 px-3 py-2">
              <span className="font-medium text-forest">{r.risk_level}</span>
              {r.approved ? " · approved" : " · needs revision"}
              {Array.isArray(r.flagged_terms) && r.flagged_terms.length > 0 && (
                <span className="text-bark/70"> · {r.flagged_terms.join(", ")}</span>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
