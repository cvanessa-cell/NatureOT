import { requireStaffPortal } from "@/lib/admin-guard";
import type { Metadata } from "next";
import { sampleGroups } from "@/lib/mock/admin-sample-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";

export const metadata: Metadata = {
  title: "Groups | Nature OT Growth OS",
};

export default async function AdminGroupsPage() {
  await requireStaffPortal();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-forest">
            Group manager
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-bark/80">
            Plan cohorts, capacity, and family invitations. External sends should stay operational—never full clinical notes.
          </p>
        </div>
        <Button type="button">Create group</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sampleGroups.map((g) => (
          <Card key={g.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl text-forest">
                  {g.name}
                </h2>
                <p className="mt-1 text-sm text-bark/75">
                  {g.city} · {g.dayTime}
                </p>
              </div>
              <Badge tone={g.status === "full" ? "warning" : "success"}>{g.status}</Badge>
            </div>
            <dl className="mt-4 grid gap-2 text-sm text-bark/90">
              <div className="flex justify-between">
                <dt className="font-medium text-forest">Age range</dt>
                <dd>{g.ageRange}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-forest">Focus</dt>
                <dd>{g.focus}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-forest">Capacity</dt>
                <dd>
                  {g.enrolled}/{g.capacity}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="!text-xs">
                View roster
              </Button>
              <Button type="button" variant="ghost" className="!text-xs">
                Send invitations (approval-gated)
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <ComplianceBanner>
        <p>
          Invitations and roster tools should log approvals when messages leave the platform. This UI is a structured shell for your workflow rules.
        </p>
      </ComplianceBanner>
    </div>
  );
}
