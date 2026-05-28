import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AccountabilityTaskActions } from "@/components/admin/marketing/accountability-task-actions";

export const metadata: Metadata = {
  title: "Accountability task | TreeTots Growth Engine",
};

export const dynamic = "force-dynamic";

type TaskDetail = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  due_date: string | null;
  status: string;
  priority: string;
  notes: string | null;
};

export default async function AccountabilityTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffPortal();
  const { id } = await params;
  const db = getAdminDb();

  const { data } = await db
    .from("accountability_tasks")
    .select("id,title,description,category,due_date,status,priority,notes")
    .eq("id", id)
    .maybeSingle();

  const task = (data as TaskDetail | null) ?? null;

  if (!task) {
    return (
      <Card>
        <p className="text-sm text-bark/80">Task not found.</p>
        <Link href="/admin/marketing/accountability" className="mt-4 inline-flex">
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
        <p className="text-sm font-medium uppercase tracking-wide text-moss">Accountability</p>
        <h1 className="mt-2 font-display text-3xl text-forest">{task.title}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge tone="sage">{task.category}</Badge>
          <Badge tone={task.priority === "high" ? "warning" : "sage"}>{task.priority}</Badge>
          <Badge tone={task.status === "complete" ? "success" : "sage"}>{task.status}</Badge>
        </div>
      </div>

      <Card>
        <p className="text-sm font-medium text-forest">Due date</p>
        <p className="mt-1 text-sm text-bark/85">{task.due_date ?? "—"}</p>
        {task.description && (
          <>
            <p className="mt-4 text-sm font-medium text-forest">Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-bark/85">{task.description}</p>
          </>
        )}
        {task.notes && (
          <>
            <p className="mt-4 text-sm font-medium text-forest">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-bark/85">{task.notes}</p>
          </>
        )}
        <div className="mt-6 border-t border-sand pt-4">
          <AccountabilityTaskActions taskId={task.id} currentStatus={task.status} />
        </div>
      </Card>

      <Link href="/admin/marketing/accountability">
        <Button type="button" variant="outline">
          Back to accountability
        </Button>
      </Link>
    </div>
  );
}
