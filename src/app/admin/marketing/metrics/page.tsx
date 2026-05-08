import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Metrics | TreeTots Growth Engine",
};

export const dynamic = "force-dynamic";

export default async function MarketingMetricsPage() {
  await requireStaffPortal();
  const db = getAdminDb();

  let leadCount = 0;
  let waitlistCount = 0;
  let callCount = 0;
  let workshopRegCount = 0;

  try {
    const [leads, waitlist, calls, workshops] = await Promise.all([
      db.from("leads").select("id", { count: "exact", head: true }),
      db.from("waitlist_entries").select("id", { count: "exact", head: true }),
      db.from("bookings").select("id", { count: "exact", head: true }),
      db.from("workshop_registrations").select("id", { count: "exact", head: true }),
    ]);
    leadCount = leads.count ?? 0;
    waitlistCount = waitlist.count ?? 0;
    callCount = calls.count ?? 0;
    workshopRegCount = workshops.count ?? 0;
  } catch {
    // empty state until Supabase is connected
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
          Metrics + attribution
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-bark/80">
          Baseline operational KPIs from existing tables. Next step wires UTM events, campaign score, and channel dashboards.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Leads (total)", value: leadCount },
          { label: "Waitlist signups", value: waitlistCount },
          { label: "Parent calls booked", value: callCount },
          { label: "Workshop registrations", value: workshopRegCount },
        ].map((m) => (
          <Card key={m.label} className="border-sand/80">
            <p className="text-xs font-medium uppercase tracking-wide text-bark/60">{m.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-forest">{String(m.value)}</p>
          </Card>
        ))}
      </div>

      <Card>
        <p className="text-sm font-medium text-forest">Next: dashboards</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-bark/85">
          <li>Campaign performance table + campaign score calculation</li>
          <li>Partner referral leaderboard</li>
          <li>City/area performance</li>
          <li>Funnel conversion rates (lead → call → enrollment proxy)</li>
        </ul>
      </Card>
    </div>
  );
}

