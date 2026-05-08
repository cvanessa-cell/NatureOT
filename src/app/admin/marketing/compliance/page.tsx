import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Compliance | TreeTots Growth Engine",
};

export const dynamic = "force-dynamic";

export default async function MarketingCompliancePage() {
  await requireStaffPortal();
  const db = getAdminDb();

  const { data } = await db
    .from("compliance_reviews")
    .select("id,risk_level,created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
          Compliance review
        </h1>
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
        <p className="text-sm font-medium text-forest">Compliance scanner (UI stub)</p>
        <p className="mt-2 text-sm text-bark/80">
          Next: paste content → scan → flagged phrases + safer alternatives → approve/reject → store decision.
        </p>
        <div className="mt-4 grid gap-2">
          <textarea
            className="min-h-[140px] w-full rounded-xl border border-sand bg-white/90 p-3 text-sm"
            placeholder="Paste a caption, email, ad copy, or landing page section..."
            defaultValue=""
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline">
              Scan
            </Button>
            <Button type="button" disabled>
              Save review
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-forest">Recent reviews</p>
        <p className="mt-2 text-sm text-bark/80">
          {data?.length ? `${data.length} stored` : "None yet"}
        </p>
      </Card>
    </div>
  );
}

