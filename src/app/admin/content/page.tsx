import { requireStaffPortal } from "@/lib/admin-guard";
import type { Metadata } from "next";
import { contentPillars, sampleContentRows } from "@/lib/mock/admin-sample-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CampaignAuthenticityCompact } from "@/components/admin/campaign-authenticity-rules";

export const metadata: Metadata = {
  title: "Content calendar | Nature OT Growth OS",
};

export default async function AdminContentPage() {
  await requireStaffPortal();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
            Content calendar
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-bark/80">
            Idea → Draft → Needs Review → Approved → Scheduled → Published. Auto-publish is blocked from Draft or Needs Review.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline">
            Calendar view
          </Button>
          <Button type="button">New idea</Button>
        </div>
      </div>

      <CampaignAuthenticityCompact />

      <Card>
        <p className="text-sm font-medium text-forest">Content pillars</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {contentPillars.map((p) => (
            <li key={p} className="rounded-full border border-sand bg-cream/50 px-3 py-1 text-xs font-medium text-bark">
              {p}
            </li>
          ))}
        </ul>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-sand bg-white shadow-sm">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="border-b border-sand bg-cream/60 text-forest">
            <tr>
              <th className="px-3 py-3 font-medium">Title</th>
              <th className="px-3 py-3 font-medium">Pillar</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Target date</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sampleContentRows.map((c) => (
              <tr key={c.id} className="border-t border-sand/70">
                <td className="px-3 py-3">{c.title}</td>
                <td className="px-3 py-3">{c.pillar}</td>
                <td className="px-3 py-3">
                  <Badge tone={c.status === "Approved" ? "success" : "warning"}>
                    {c.status}
                  </Badge>
                </td>
                <td className="px-3 py-3 tabular-nums">{c.date}</td>
                <td className="px-3 py-3">
                  <Button type="button" variant="outline" className="!min-h-9 !text-xs">
                    Open workflow
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-bark/65">
        Social posts and paid ad launches use explicit approval transitions—never silent Draft→Published jumps.
      </p>
    </div>
  );
}
