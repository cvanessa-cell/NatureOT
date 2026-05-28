import { requireStaffPortal } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrganizationForm } from "@/components/admin/marketing/organization-form";

export const metadata: Metadata = {
  title: "New organization | TreeTots Growth Engine",
};

export default async function NewOrganizationPage() {
  await requireStaffPortal();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">New organization</h1>
        <p className="mt-2 max-w-3xl text-sm text-bark/80">
          Create a partner record, set permission status, then generate outreach tasks.
        </p>
      </div>
      <OrganizationForm />
      <Link href="/admin/marketing/partners">
        <Button type="button" variant="outline">
          Back to partners
        </Button>
      </Link>
    </div>
  );
}
