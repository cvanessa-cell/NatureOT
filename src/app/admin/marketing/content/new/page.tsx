import { requireStaffPortal } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContentAssetForm } from "@/components/admin/marketing/content-asset-form";

export const metadata: Metadata = {
  title: "New content asset | TreeTots Growth Engine",
};

export default async function NewContentAssetPage() {
  await requireStaffPortal();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">New content asset</h1>
        <p className="mt-2 max-w-3xl text-sm text-bark/80">
          Create a draft asset, run compliance check, then approve/schedule.
        </p>
      </div>
      <ContentAssetForm />
      <Link href="/admin/marketing/content">
        <Button type="button" variant="outline">
          Back to content
        </Button>
      </Link>
    </div>
  );
}
