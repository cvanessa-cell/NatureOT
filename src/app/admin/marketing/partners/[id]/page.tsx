import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PartnerOutreachActions } from "@/components/admin/marketing/partner-outreach-actions";

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

type OutreachTaskRow = {
  id: string;
  task_type: string;
  channel: string | null;
  subject: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
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

  const { data: taskRows } = org
    ? await db
        .from("outreach_tasks")
        .select("id,task_type,channel,subject,status,due_date,created_at")
        .eq("organization_id", id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: null };

  const tasks = (taskRows as OutreachTaskRow[] | null) ?? [];

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
        <h1 className="mt-2 font-display text-3xl text-forest">
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
          <PartnerOutreachActions organizationId={org.id} organizationName={org.name} />
        </Card>
      </div>

      <Card>
        <p className="text-sm font-medium text-forest">Outreach tasks</p>
        <p className="mt-1 text-xs text-bark/70">
          Tasks require manual approval before any external message is sent.
        </p>
        {tasks.length === 0 ? (
          <p className="mt-4 text-sm text-bark/70">No outreach tasks yet. Use the buttons above to create one.</p>
        ) : (
          <ul className="mt-4 divide-y divide-sand/70">
            {tasks.map((task) => (
              <li key={task.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-forest">{task.subject ?? task.task_type}</p>
                  <p className="mt-1 text-xs text-bark/70">
                    {task.task_type}
                    {task.channel ? ` · ${task.channel}` : ""}
                    {task.due_date ? ` · due ${new Date(task.due_date).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <Badge tone={task.status === "complete" ? "success" : "sage"}>{task.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Link href="/admin/marketing/partners" className="inline-flex">
        <Button type="button" variant="outline">
          Back to partners
        </Button>
      </Link>
    </div>
  );
}

