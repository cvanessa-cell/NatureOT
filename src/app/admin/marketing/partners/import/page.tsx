import { requireStaffPortal } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { PartnerImporter } from "@/components/admin/marketing/partner-importer";

export const metadata: Metadata = {
  title: "Import partners | TreeTots Growth Engine",
};

export default async function PartnerImportPage() {
  await requireStaffPortal();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">
          Import partners from CSV
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-bark/80">
          Import public business directory data you already have permission to use. Do not scrape private groups or upload confidential lists.
        </p>
      </div>

      <ComplianceBanner>
        <p>
          Store only what you can ethically contact: public email/phone/website, permission state, and operational notes.
          Do not include child/client PHI in partner records.
        </p>
      </ComplianceBanner>

      <Card>
        <p className="text-sm font-medium text-forest">Template</p>
        <p className="mt-2 text-sm text-bark/80">
          Next step: we’ll add an upload form and server-side parser. For now, use this minimal header row:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-sand bg-white/80 p-3 text-xs text-bark">
name,category,website,email,phone,city,county,facebook_url,instagram_url,relevance_score,proximity_score,referral_likelihood_score,relationship_priority_score,permission_to_contact,notes
        </pre>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/marketing/partners">
            <Button type="button" variant="outline">
              Back to partners
            </Button>
          </Link>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-forest">Import</p>
        <p className="mt-2 text-sm text-bark/80">
          Paste CSV below. Start with a dry run to validate rows before importing.
        </p>
        <div className="mt-4">
          <PartnerImporter />
        </div>
      </Card>
    </div>
  );
}

