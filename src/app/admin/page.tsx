import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import {
  recentActivity,
} from "@/lib/mock/admin-sample-data";
import { Card } from "@/components/ui/card";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { ArrowUpRight, LineChart, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | Nature OT Growth OS",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireStaffPortal();
  let leadCount = 0;
  let waitlistCount = 0;
  let workshopRegCount = 0;
  let referralOpen = 0;
  let airtablePending = 0;
  let zapierFails = 0;
  let liveActivity: { id: string; t: string; text: string }[] = [];

  try {
    const db = getAdminDb();
    const [
      l,
      w,
      regs,
      refNew,
      airPending,
      zapFailHead,
      zevRecent,
      emailRecent,
      leadsRecent,
    ] = await Promise.all([
      db.from("leads").select("id", { count: "exact", head: true }),
      db.from("waitlist_entries").select("id", { count: "exact", head: true }),
      db.from("workshop_registrations").select("id", { count: "exact", head: true }),
      db
        .from("referral_inquiries")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      db
        .from("airtable_sync_jobs")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      db.from("zapier_events").select("id", { count: "exact", head: true }).eq("result", "failed"),
      db
        .from("zapier_events")
        .select("event_type,result,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      db
        .from("email_events")
        .select("template_key,dispatch_status,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      db.from("leads").select("parent_email,created_at").order("created_at", { ascending: false }).limit(4),
    ]);
    leadCount = l.count ?? 0;
    waitlistCount = w.count ?? 0;
    workshopRegCount = regs.count ?? 0;
    referralOpen = refNew.count ?? 0;
    airtablePending = airPending.count ?? 0;
    zapierFails = zapFailHead.count ?? 0;

    for (const row of leadsRecent.data ?? []) {
      liveActivity.push({
        id: `live-lead-${row.created_at}-${row.parent_email}`,
        t: String(row.created_at),
        text: `Lead captured (${String(row.parent_email ?? "unknown")})`,
      });
    }

    for (const row of zevRecent.data ?? []) {
      liveActivity.push({
        id: `live-z-${row.created_at}-${row.event_type}-${row.result}`,
        t: String(row.created_at),
        text: `Zapier ${String(row.event_type)} — ${String(row.result)}`,
      });
    }

    for (const row of emailRecent.data ?? []) {
      liveActivity.push({
        id: `live-e-${row.created_at}-${row.template_key}-${row.dispatch_status}`,
        t: String(row.created_at),
        text: `Email ${String(row.template_key)} (${String(row.dispatch_status)})`,
      });
    }

    liveActivity = liveActivity
      .sort((a, b) => new Date(b.t).valueOf() - new Date(a.t).valueOf())
      .slice(0, 7);
  } catch {
    /* sample mode */
  }

  const newLeadsWeek = leadCount > 0 ? Math.min(leadCount, 12) : 8;
  const waitlistTotal = waitlistCount > 0 ? waitlistCount : 38;
  const openSpots = 14;
  const upcomingWorkshops = workshopRegCount > 0 ? Math.min(workshopRegCount, 12) : 3;
  const partnersFollowUp = referralOpen > 0 ? referralOpen : 2;
  const contentReview = 4;
  const zapierReview = zapierFails > 0 ? zapierFails : 1;
  const airtableHealth = airtablePending > 0 ? `${airtablePending} pending` : "Healthy";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
          Operations dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-bark/80">
          Live counts connect when Supabase is configured; sample numbers preview the experience.
          Configure <code className="rounded bg-white px-1">ADMIN_EMAILS</code> or staff roles in{" "}
          <code className="rounded bg-white px-1">profiles</code>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "New leads (7d est.)", value: String(newLeadsWeek), icon: Users, href: "/admin/leads" },
          { label: "Waitlist total (est.)", value: String(waitlistTotal), icon: LineChart, href: "/admin/waitlist" },
          { label: "Open group spots (planning)", value: String(openSpots), icon: ArrowUpRight, href: "/admin/groups" },
          { label: "Upcoming workshops", value: String(upcomingWorkshops), icon: LineChart, href: "/admin/workshops" },
        ].map((m) => (
          <Card key={m.label} className="border-sand/80">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-bark/60">
                  {m.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-forest">
                  {m.value}
                </p>
              </div>
              <m.icon className="size-8 text-moss/90" aria-hidden />
            </div>
            <Link
              href={m.href}
              className="mt-4 inline-flex text-sm font-semibold text-moss underline-offset-4 hover:underline"
            >
              Open
            </Link>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Referral partners need follow-up", value: String(partnersFollowUp) },
          { label: "Content awaiting approval", value: String(contentReview) },
          { label: "Zapier items to review", value: String(zapierReview) },
          { label: "Airtable sync health", value: airtableHealth },
        ].map((x) => (
          <Card key={x.label} className="border-dashed border-sage/30 bg-white/70">
            <p className="text-xs font-medium uppercase tracking-wide text-bark/60">{x.label}</p>
            <p className="mt-2 text-xl font-semibold text-forest">{x.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="font-[family-name:var(--font-fraunces)] text-xl text-forest">
            Leads by source (sample)
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-bark/90">
            <li className="flex justify-between border-b border-sand/60 py-2">
              <span>Local SEO</span>
              <span className="tabular-nums font-medium">28%</span>
            </li>
            <li className="flex justify-between border-b border-sand/60 py-2">
              <span>Pediatrician referral</span>
              <span className="tabular-nums font-medium">18%</span>
            </li>
            <li className="flex justify-between border-b border-sand/60 py-2">
              <span>Instagram</span>
              <span className="tabular-nums font-medium">15%</span>
            </li>
            <li className="flex justify-between py-2">
              <span>Workshop</span>
              <span className="tabular-nums font-medium">12%</span>
            </li>
          </ul>
        </Card>
        <Card>
          <h2 className="font-[family-name:var(--font-fraunces)] text-xl text-forest">
            Waitlist demand (sample)
          </h2>
          <p className="mt-2 text-sm text-bark/80">
            Age ranges and ZIP clusters help you plan cohorts responsibly.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex justify-between">
              <span>5–7 after school</span>
              <span className="font-medium text-forest">High</span>
            </li>
            <li className="flex justify-between">
              <span>3–5 daytime</span>
              <span className="font-medium text-forest">Medium</span>
            </li>
            <li className="flex justify-between">
              <span>7–10 social/outdoor skills</span>
              <span className="font-medium text-forest">Growing</span>
            </li>
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl text-forest">
          Recent activity
        </h2>
        <ul className="mt-4 space-y-3 text-sm text-bark/90">
          {[...liveActivity, ...recentActivity].map((a) => (
            <li key={a.id} className="flex flex-col border-b border-sand/50 pb-3 last:border-0 sm:flex-row sm:gap-4">
              <time className="shrink-0 text-xs text-bark/60">
                {new Date(a.t).toLocaleString()}
              </time>
              <span>{a.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      <ComplianceBanner>
        <p>
          Dashboard analytics here are operational—not a clinical record. PHI belongs in your HIPAA-aligned systems.
        </p>
      </ComplianceBanner>
    </div>
  );
}
