import { requireStaffPortal } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "New content asset | TreeTots Growth Engine",
};

export default async function NewContentAssetPage() {
  await requireStaffPortal();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
          New content asset
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-bark/80">
          Create a draft asset, run compliance check, then approve/schedule.
        </p>
      </div>

      <Card>
        <p className="text-sm font-medium text-forest">Form UI (next)</p>
        <p className="mt-2 text-sm text-bark/80">
          Next step: add a validated form and persist to <code>content_assets</code>, with a compliance scan and stored review.
        </p>
        <Link href="/admin/marketing/content" className="mt-4 inline-flex">
          <Button type="button" variant="outline">
            Back to content
          </Button>
        </Link>
      </Card>
    </div>
  );
}

