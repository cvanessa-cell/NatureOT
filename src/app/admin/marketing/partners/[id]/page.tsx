import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Partner | TreeTots Growth Engine",
};

export const dynamic = "force-dynamic";

type OrganizationDetail = {
  id: string;
  name: string;
  category: string;
  city: string | null;
  status: string;
  priority_score: number;
  notes: string | null;
  permission_to_contact: boolean;
  next_follow_up_at: string | null;
};

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffPortal();
  const { id } = await params;
  const db = getAdminDb();

  const { data } = await db
    .from("organizations")
    .select("id,name,category,city,status,priority_score,notes,permission_to_contact,next_follow_up_at")
    .eq("id", id)
    .maybeSingle();

  const org = (data as unknown as OrganizationDetail | null) ?? null;

  if (!org) {
    return (
      <Card>
        <p className="text-sm text-bark/80">Partner not found.</p>
        <Link href="/admin/marketing/partners" className="mt-4 inline-flex">
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
        <p className="text-sm font-medium uppercase tracking-wide text-moss">Organization</p>
        <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl text-forest">
          {org.name}
        </h1>
        <p className="mt-2 text-sm text-bark/80">
          {org.category} {org.city ? `· ${org.city}` : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-bark/60">Status</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={String(org.status).includes("due") ? "warning" : "sage"}>{org.status}</Badge>
            <Badge tone={org.permission_to_contact ? "success" : "warning"}>
              {org.permission_to_contact ? "ok to contact" : "permission unknown"}
            </Badge>
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-bark/60">Priority</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-forest">
            {Number(org.priority_score ?? 0).toFixed(1)}
          </p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-bark/60">Next follow-up</p>
          <p className="mt-2 text-sm text-bark/85">
            {org.next_follow_up_at ? new Date(org.next_follow_up_at).toLocaleDateString() : "—"}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-forest">Notes</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-bark/85">{org.notes ?? "—"}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button type="button" variant="outline">
              Create outreach task (next)
            </Button>
            <Button type="button" variant="ghost">
              Draft intro email (next)
            </Button>
          </div>
        </Card>
      </div>

      <Link href="/admin/marketing/partners" className="inline-flex">
        <Button type="button" variant="outline">
          Back to partners
        </Button>
      </Link>
    </div>
  );
}

