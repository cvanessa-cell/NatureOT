import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Campaign | TreeTots Growth Engine",
};

export const dynamic = "force-dynamic";

type CampaignDetail = {
  id: string;
  name: string;
  type: string;
  audience: string | null;
  status: string;
  goal: string | null;
  benchmark: string | null;
  budget: number | null;
  channel: string | null;
  cta: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  actual_leads: number | null;
  actual_calls: number | null;
  actual_referrals: number | null;
  actual_enrollments: number | null;
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffPortal();
  const { id } = await params;
  const db = getAdminDb();

  const { data } = await db
    .from("campaigns")
    .select(
      "id,name,type,audience,status,goal,benchmark,budget,channel,cta,start_date,end_date,notes,actual_leads,actual_calls,actual_referrals,actual_enrollments"
    )
    .eq("id", id)
    .maybeSingle();

  const c = (data as unknown as CampaignDetail | null) ?? null;

  if (!c) {
    return (
      <Card>
        <p className="text-sm text-bark/80">Campaign not found.</p>
        <Link href="/admin/marketing/campaigns" className="mt-4 inline-flex">
          <Button type="button" variant="outline">
            Back
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-moss">Campaign</p>
        <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl text-forest">
          {c.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-bark/80">
          <span>{c.type}</span>
          {c.audience ? <span>· {c.audience}</span> : null}
          <Badge tone={c.status === "active" ? "success" : "sage"}>{c.status}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm font-medium text-forest">Plan</p>
          <p className="mt-2 text-sm text-bark/85">
            <span className="font-medium text-forest">Goal:</span> {c.goal ?? "—"}
          </p>
          <p className="mt-2 text-sm text-bark/85">
            <span className="font-medium text-forest">Benchmark:</span> {c.benchmark ?? "—"}
          </p>
          <p className="mt-2 text-sm text-bark/85">
            <span className="font-medium text-forest">Channel:</span> {c.channel ?? "—"}
          </p>
          <p className="mt-2 text-sm text-bark/85">
            <span className="font-medium text-forest">CTA:</span> {c.cta ?? "—"}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-forest">Results (manual inputs for now)</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <li className="rounded-xl border border-sand bg-white/70 p-3">
              <p className="text-xs uppercase tracking-wide text-bark/60">Leads</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-forest">{c.actual_leads ?? 0}</p>
            </li>
            <li className="rounded-xl border border-sand bg-white/70 p-3">
              <p className="text-xs uppercase tracking-wide text-bark/60">Calls</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-forest">{c.actual_calls ?? 0}</p>
            </li>
            <li className="rounded-xl border border-sand bg-white/70 p-3">
              <p className="text-xs uppercase tracking-wide text-bark/60">Referrals</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-forest">{c.actual_referrals ?? 0}</p>
            </li>
            <li className="rounded-xl border border-sand bg-white/70 p-3">
              <p className="text-xs uppercase tracking-wide text-bark/60">Enrollments</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-forest">{c.actual_enrollments ?? 0}</p>
            </li>
          </ul>
        </Card>
      </div>

      <Card>
        <p className="text-sm font-medium text-forest">Notes</p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-bark/85">{c.notes ?? "—"}</p>
      </Card>

      <Link href="/admin/marketing/campaigns" className="inline-flex">
        <Button type="button" variant="outline">
          Back to campaigns
        </Button>
      </Link>
    </div>
  );
}

