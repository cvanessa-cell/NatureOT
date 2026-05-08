import { requireStaffPortal } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Automations | TreeTots Growth Engine",
};

export default async function MarketingAutomationsPage() {
  await requireStaffPortal();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
            Automations
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-bark/80">
            Internal task automation + manual approval queue for external messages. No auto-posting, no auto-DMs.
          </p>
        </div>
        <Link href="/admin/zapier">
          <Button type="button" variant="outline">
            Open Zapier catalog
          </Button>
        </Link>
      </div>

      <Card>
        <p className="text-sm font-medium text-forest">Next steps</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-bark/85">
          <li>Enable automation rules for “new lead follow-up” and “weekly marketing report”.</li>
          <li>Keep external email sends behind explicit approval unless you intentionally enable auto-send.</li>
          <li>Never automate social media DMs or posting into groups.</li>
        </ul>
      </Card>
    </div>
  );
}

