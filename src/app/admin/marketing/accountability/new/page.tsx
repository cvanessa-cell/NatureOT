import { requireStaffPortal } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AccountabilityTaskForm } from "@/components/admin/marketing/accountability-task-form";

export const metadata: Metadata = {
  title: "New accountability task | TreeTots Growth Engine",
};

export default async function NewAccountabilityTaskPage() {
  await requireStaffPortal();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">New accountability task</h1>
        <p className="mt-2 max-w-3xl text-sm text-bark/80">
          Track launch milestones, outreach cadence, and weekly execution items.
        </p>
      </div>
      <AccountabilityTaskForm />
      <Link href="/admin/marketing/accountability">
        <Button type="button" variant="outline">
          Back to accountability
        </Button>
      </Link>
    </div>
  );
}
