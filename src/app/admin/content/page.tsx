import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import { contentPillars } from "@/lib/mock/admin-sample-data";
import { Card } from "@/components/ui/card";
import { CampaignAuthenticityCompact } from "@/components/admin/campaign-authenticity-rules";
import {
  ContentCalendarWorkspace,
  type ContentCalendarRow,
} from "@/components/admin/marketing/content-calendar-workspace";

export const metadata: Metadata = {
  title: "Content calendar | Nature OT Growth OS",
};

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireStaffPortal();
  const db = getAdminDb();

  let rows: ContentCalendarRow[] = [];
  try {
    const { data } = await db
      .from("content_calendar_posts")
      .select("id,title,platform,status,publish_at,target_audience")
      .order("publish_at", { ascending: true, nullsFirst: false })
      .limit(100);
    rows = (data as ContentCalendarRow[] | null) ?? [];
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">Content calendar</h1>
        <p className="mt-2 max-w-2xl text-sm text-bark/80">
          Idea → Draft → Approved → Scheduled → Published. Auto-publish is blocked from Draft or Needs Review.
        </p>
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

      <ContentCalendarWorkspace rows={rows} />

      <p className="text-xs text-bark/65">
        Social posts and paid ad launches use explicit approval transitions—never silent Draft→Published jumps.
      </p>
    </div>
  );
}
