import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import { sampleWorkshops } from "@/lib/mock/admin-sample-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CampaignAuthenticityCompact } from "@/components/admin/campaign-authenticity-rules";
import {
  practiceWideBookings,
  waitlistAddsFromWorkshopCaption,
  enrolledCaption,
} from "@/lib/admin/workshop-kpis";

export const metadata: Metadata = {
  title: "Workshops | Nature OT Growth OS",
};

export const dynamic = "force-dynamic";

type RegistrationRow = {
  id: string;
  workshop_title: string | null;
  workshop_slug: string | null;
  parent_name: string | null;
  parent_email: string | null;
  status: string | null;
  created_at: string;
};

type Metric = {
  label: string;
  value: string;
  caption?: string;
};

export default async function AdminWorkshopsPage() {
  await requireStaffPortal();
  const rehearsal = sampleWorkshops[0];
  let registrations: RegistrationRow[] = [];
  let regTotal: number | null = null;
  let metrics: Metric[] = [];
  let dataConnected = false;

  try {
    const db = getAdminDb();
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    const [
      listRes,
      countRes,
      attendedRes,
      noShowRes,
      weeklyRes,
      emailRes,
      zapRes,
      bookingsRes,
    ] = await Promise.all([
      db
        .from("workshop_registrations")
        .select(
          "id, workshop_title, workshop_slug, parent_name, parent_email, child_age_range, status, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(50),
      db.from("workshop_registrations").select("*", { count: "exact", head: true }),
      db
        .from("workshop_registrations")
        .select("*", { count: "exact", head: true })
        .eq("status", "attended"),
      db
        .from("workshop_registrations")
        .select("*", { count: "exact", head: true })
        .eq("status", "no_show"),
      db
        .from("workshop_registrations")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo),
      db
        .from("email_events")
        .select("*", { count: "exact", head: true })
        .eq("template_key", "workshop_registration_confirmation"),
      db
        .from("zapier_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "workshop_registration_created"),
      db.from("bookings").select("*", { count: "exact", head: true }),
    ]);

    registrations = (listRes.data as RegistrationRow[] | null) ?? [];
    regTotal = countRes.count ?? 0;

    dataConnected = true;
    const totalDisplay = String(regTotal);
    const weekDisplay = String(weeklyRes.count ?? 0);
    const emailOps = emailRes.count ?? 0;
    const zapRelay = zapRes.count ?? 0;
    const bookingsTotal =
      typeof bookingsRes.count === "number" ? bookingsRes.count : null;
    const bookingSummary = practiceWideBookings(bookingsTotal);

    metrics = [
      {
        label: "Total registrations",
        value: totalDisplay,
        caption: "Captured in Supabase workshop_registrations.",
      },
      {
        label: "Registrations · last 7 days",
        value: weekDisplay,
        caption: "Simple trend pulse — correlate with launches manually.",
      },
      {
        label: "Attendance (checked-in)",
        value: String(attendedRes.count ?? 0),
        caption:
          attendedRes.count === 0 && regTotal === 0
            ? "No registrations yet."
            : "Statuses updated when ops marks attended in Growth OS.",
      },
      {
        label: "No-shows tracked",
        value: String(noShowRes.count ?? 0),
        caption: "Requires manual disposition — not inferred from scheduler.",
      },
      {
        label: "Confirmation emails logged",
        value: String(emailOps),
        caption: "Counts email_events with workshop_registration_confirmation template.",
      },
      {
        label: "Zapier relays logged",
        value: String(zapRelay),
        caption: "workshop_registration_created audit rows regardless of Zapier ENABLED flag.",
      },
      {
        label: "Booked calls · practice-wide",
        value: bookingSummary.value,
        caption: bookingSummary.caption,
      },
      {
        label: "Waitlist adds from workshops",
        value: waitlistAddsFromWorkshopCaption().value,
        caption: waitlistAddsFromWorkshopCaption().caption,
      },
      {
        label: "Enrolled (program)",
        value: enrolledCaption().value,
        caption: enrolledCaption().caption,
      },
    ];
  } catch {
    dataConnected = false;
    registrations = [];
    metrics = [
      {
        label: "Total registrations",
        value: String(rehearsal.registrations),
        caption:
          "Rehearsal sample — connect Supabase with service role credentials to hydrate live KPIs.",
      },
      {
        label: "Registrations · last 7 days",
        value: "—",
        caption: "Awaiting Growth OS telemetry.",
      },
      {
        label: "Attendance",
        value: "—",
        caption: "Not displaying rehearsal attendance — avoids fake funnel stats.",
      },
      {
        label: "No-shows tracked",
        value: "—",
        caption: "Hook check-in tooling before publishing this metric.",
      },
      {
        label: "Confirmation emails logged",
        value: "—",
        caption: "Need live email_events linkage.",
      },
      {
        label: "Zapier relays logged",
        value: "—",
        caption: "Need zapier_events populated from live traffic.",
      },
      ...(() => {
        const b = practiceWideBookings(null);
        const wCaption = waitlistAddsFromWorkshopCaption();
        const eCaption = enrolledCaption();
        return [
          { label: "Booked calls · practice-wide", value: b.value, caption: b.caption },
          { label: "Waitlist adds from workshops", value: wCaption.value, caption: wCaption.caption },
          { label: "Enrolled (program)", value: eCaption.value, caption: eCaption.caption },
        ];
      })(),
    ];
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-forest">
            Workshops
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-bark/80">
            Live metrics pull from Growth OS relational tables whenever Supabase credentials are reachable.
            Conversion metrics lacking CRM hooks stay labeled plainly — never masqueraded as audited funnel
            data.
          </p>
          {!dataConnected && (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              Supabase KPI fetch failed — showing rehearsal totals only where explicitly labeled.
            </p>
          )}
        </div>
        <Button type="button">Create workshop</Button>
      </div>

      <CampaignAuthenticityCompact />

      <Card>
        <h2 className="font-display text-2xl text-forest">{rehearsal.title}</h2>
        <p className="mt-1 text-sm text-bark/75">{rehearsal.date}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-sand bg-cream/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-bark/55">{m.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-forest">{m.value}</p>
              {m.caption && <p className="mt-2 text-[11px] leading-snug text-bark/75">{m.caption}</p>}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" variant="secondary">
            Trigger follow-up sequence
          </Button>
          <Button type="button" variant="outline">
            Export registrants
          </Button>
        </div>
      </Card>

      <Card className="border-sand/90">
        <h2 className="font-display text-xl text-forest">
          Recent registrations (Growth OS)
        </h2>
        <p className="mt-1 text-xs text-bark/70">
          Pulled from <code className="rounded bg-cream px-1">workshop_registrations</code>
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[880px] w-full text-left text-sm">
            <thead className="border-b border-sand bg-cream/60 text-forest">
              <tr>
                <th className="px-3 py-3 font-medium">Saved at</th>
                <th className="px-3 py-3 font-medium">Workshop</th>
                <th className="px-3 py-3 font-medium">Parent</th>
                <th className="px-3 py-3 font-medium">Email</th>
                <th className="px-3 py-3 font-medium">Slug</th>
                <th className="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 && (
                <tr className="border-t border-sand/70">
                  <td className="px-3 py-6 text-bark/70" colSpan={6}>
                    No registrations in Supabase yet — rehearse externally until API traffic fills this table.
                  </td>
                </tr>
              )}
              {registrations.map((r) => (
                <tr key={r.id} className="border-t border-sand/70">
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-bark/80 tabular-nums">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-3">{r.workshop_title ?? "—"}</td>
                  <td className="px-3 py-3">{r.parent_name ?? "—"}</td>
                  <td className="px-3 py-3">{r.parent_email ?? "—"}</td>
                  <td className="px-3 py-3 font-mono text-[11px] text-bark/80">{r.workshop_slug ?? "—"}</td>
                  <td className="px-3 py-3">{r.status ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
