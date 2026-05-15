import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { ArrowUpRight, Calendar, Handshake, LineChart, ListChecks, Megaphone } from "lucide-react";
import { getMarketingDashboardStats, getMarketingSyncHealth } from "@/lib/marketing/reporting";

export const metadata: Metadata = {
  title: "Marketing dashboard | TreeTots Growth Engine",
};

export const dynamic = "force-dynamic";

export default async function MarketingDashboardPage() {
  await requireStaffPortal();

  const db = getAdminDb();

  let orgCount = 0;
  let contactCount = 0;
  let campaignCount = 0;
  let contentCount = 0;
  let dueCount = 0;
  let mStats = {
    totalLeads: 0,
    guideDownloads: 0,
    waitlistJoins: 0,
    workshopRegistrations: 0,
    unsubscribes: 0,
    failedSends: 0,
  };
  let syncHealth = {
    zapierLastAt: null as string | null,
    zapierLastResult: null as string | null,
    zapierLastKey: null as string | null,
    zapierLastFailureAt: null as string | null,
    zapierLastFailureMessage: null as string | null,
    airtablePending: 0,
    airtableFailed: 0,
  };

  try {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const [orgs, contacts, campaigns, content, tasksDue, stats, sync] = await Promise.all([
      db.from("organizations").select("id", { count: "exact", head: true }),
      db.from("contacts").select("id", { count: "exact", head: true }),
      db.from("campaigns").select("id", { count: "exact", head: true }),
      db.from("content_assets").select("id", { count: "exact", head: true }),
      db
        .from("outreach_tasks")
        .select("id", { count: "exact", head: true })
        .in("status", ["not_started", "in_progress", "waiting", "needs_review"])
        .lte("due_date", new Date().toISOString().slice(0, 10)),
      getMarketingDashboardStats({
        startDate: monthStart.toISOString(),
        endDate: new Date().toISOString(),
      }),
      getMarketingSyncHealth(),
    ]);

    orgCount = orgs.count ?? 0;
    contactCount = contacts.count ?? 0;
    campaignCount = campaigns.count ?? 0;
    contentCount = content.count ?? 0;
    dueCount = tasksDue.count ?? 0;
    mStats = stats;
    syncHealth = sync;
  } catch {
    // empty state until Supabase is connected
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
          TreeTots Growth Engine
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-bark/80">
          Centralized marketing command center for ethical, privacy-safe outreach. This admin area is
          non-clinical and should not store child medical details or diagnosis-targeting language.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Partners in Market Map", value: String(orgCount || 0), icon: Handshake, href: "/admin/marketing/partners" },
          { label: "Contacts", value: String(contactCount || 0), icon: Megaphone, href: "/admin/marketing/partners" },
          { label: "Campaigns", value: String(campaignCount || 0), icon: LineChart, href: "/admin/marketing/campaigns" },
          { label: "Content assets", value: String(contentCount || 0), icon: Calendar, href: "/admin/marketing/content" },
        ].map((m) => (
          <Card key={m.label} className="border-sand/80">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-bark/60">{m.label}</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-forest">{m.value}</p>
              </div>
              <m.icon className="size-8 text-moss/90" aria-hidden />
            </div>
            <Link
              href={m.href}
              className="mt-4 inline-flex text-sm font-semibold text-moss underline-offset-4 hover:underline"
            >
              Open <ArrowUpRight className="ml-1 size-4" aria-hidden />
            </Link>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Leads this month", value: mStats.totalLeads },
          { label: "Guide downloads", value: mStats.guideDownloads },
          { label: "Waitlist joins", value: mStats.waitlistJoins },
          { label: "Workshop registrations", value: mStats.workshopRegistrations },
          { label: "Unsubscribes", value: mStats.unsubscribes },
          { label: "Failed sends", value: mStats.failedSends },
        ].map((metric) => (
          <Card key={metric.label}>
            <p className="text-xs uppercase tracking-wide text-bark/60">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-forest">{metric.value}</p>
          </Card>
        ))}
      </div>

      <Card className="border-sage/35">
        <h2 className="font-[family-name:var(--font-fraunces)] text-lg text-forest">Integration sync health</h2>
        <p className="mt-2 text-sm text-bark/80">
          Latest Zapier webhook attempts and queued Airtable jobs (operational integrations only — no PHI in these counts).
        </p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="font-medium text-bark/70">Last Zapier row</dt>
            <dd className="tabular-nums text-forest">{syncHealth.zapierLastAt ?? "—"}</dd>
            <dd className="mt-1 text-xs text-bark/70">
              {syncHealth.zapierLastResult ?? "n/a"}
              {syncHealth.zapierLastKey ? ` · ${syncHealth.zapierLastKey}` : ""}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-bark/70">Last Zapier failure</dt>
            <dd className="tabular-nums text-forest">{syncHealth.zapierLastFailureAt ?? "—"}</dd>
            <dd className="mt-1 line-clamp-2 text-xs text-red-900/85">{syncHealth.zapierLastFailureMessage ?? "None recorded"}</dd>
          </div>
          <div>
            <dt className="font-medium text-bark/70">Airtable pending</dt>
            <dd className="text-2xl font-semibold tabular-nums text-forest">{syncHealth.airtablePending}</dd>
          </div>
          <div>
            <dt className="font-medium text-bark/70">Airtable failed</dt>
            <dd className="text-2xl font-semibold tabular-nums text-forest">{syncHealth.airtableFailed}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/admin/zapier" className="text-moss underline underline-offset-4 hover:opacity-90">
            Open Zapier diagnostics
          </Link>
          <Link href="/admin/airtable" className="text-moss underline underline-offset-4 hover:opacity-90">
            Review Airtable queue
          </Link>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-fraunces)] text-xl text-forest">
                This week’s priority
              </h2>
              <p className="mt-2 text-sm text-bark/85">
                Tasks due today or overdue (outreach + accountability).
              </p>
            </div>
            <ListChecks className="mt-1 size-7 text-moss" aria-hidden />
          </div>
          <p className="mt-4 text-2xl font-semibold text-forest tabular-nums">{dueCount || 0}</p>
          <Link href="/admin/marketing/accountability" className="mt-4 inline-flex text-sm font-semibold text-moss underline">
            Review accountability
          </Link>
        </Card>

        <ComplianceBanner>
          <p className="text-sm">
            Guardrails: no “your child has…” language, no diagnosis-targeting, no guarantees/cures, no auto-posting or auto-DMs.
            External messages require manual approval by default.
          </p>
        </ComplianceBanner>
      </div>
    </div>
  );
}

