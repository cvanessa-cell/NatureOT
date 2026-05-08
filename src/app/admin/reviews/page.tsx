import { requireStaffPortal } from "@/lib/admin-guard";
import type { Metadata } from "next";
import { sampleReviewsQueue } from "@/lib/mock/admin-sample-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { BLOCKED_CAMPAIGN_PRACTICES } from "@/lib/campaign-authenticity";

export const metadata: Metadata = {
  title: "Reviews & testimonials | Nature OT Growth OS",
};

export default async function AdminReviewsPage() {
  await requireStaffPortal();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
          Reviews & testimonials
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-bark/80">
          Publishing is blocked unless authorization is on file and admin approval is granted.
        </p>
      </div>

      <ComplianceBanner>
        <p>
          Never publish identifiable testimonials without written authorization appropriate to your legal workflow.
        </p>
        <p className="mt-2 font-medium text-forest">Blocked by policy</p>
        <ul className="mt-1 list-inside list-disc text-bark/90">
          {BLOCKED_CAMPAIGN_PRACTICES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </ComplianceBanner>

      <div className="space-y-4">
        {sampleReviewsQueue.map((r) => {
          const canPublish =
            r.authStatus === "Authorized" && r.adminApproval === "Approved";
          return (
            <Card key={r.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-medium text-bark/70">Quote</p>
                  <blockquote className="mt-1 text-base text-forest">&ldquo;{r.quote}&rdquo;</blockquote>
                  <p className="mt-2 text-xs text-bark/60">Initials: {r.parentInitials}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={r.authStatus === "Authorized" ? "success" : "warning"}>
                    Auth: {r.authStatus}
                  </Badge>
                  <Badge tone={r.adminApproval === "Approved" ? "success" : "neutral"}>
                    Admin: {r.adminApproval}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-sand pt-4">
                {!canPublish && (
                  <p className="text-sm font-medium text-amber-900">
                    Publish disabled until authorization + admin approval are complete.
                  </p>
                )}
                <Button type="button" disabled={!canPublish}>
                  Publish to site
                </Button>
                <Button type="button" variant="outline">
                  Request authorization
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
