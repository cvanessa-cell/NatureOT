import { requireStaffPortal } from "@/lib/admin-guard";
import type { Metadata } from "next";
import { CampaignAuthenticityRulesFull } from "@/components/admin/campaign-authenticity-rules";

export const metadata: Metadata = {
  title: "Campaign authenticity | Nature OT Growth OS",
};

export default async function AdminCampaignPolicyPage() {
  await requireStaffPortal();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">
          Campaign authenticity
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-bark/80">
          Policy enforced across Growth modules. Use this page for staff onboarding and audits.
        </p>
      </div>

      <CampaignAuthenticityRulesFull />
    </div>
  );
}
