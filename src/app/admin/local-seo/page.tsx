import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import { texasCitiesSeo } from "@/lib/mock/admin-sample-data";
import { CampaignAuthenticityCompact } from "@/components/admin/campaign-authenticity-rules";
import {
  LocalSeoTable,
  type LocalSeoRow,
} from "@/components/admin/marketing/local-seo-table";

export const metadata: Metadata = {
  title: "Local SEO | Nature OT Growth OS",
};

export const dynamic = "force-dynamic";

function mockRows(): LocalSeoRow[] {
  return texasCitiesSeo.map((row, index) => ({
    id: `mock-${row.slug}`,
    slug: row.slug,
    city: row.city,
    title: row.city,
    status:
      row.status === "Published"
        ? "published"
        : row.status === "Approved"
          ? "approved"
          : row.status === "Needs Review"
            ? "reviewed"
            : "planned",
    meta_description: row.keyword,
  }));
}

export default async function AdminLocalSeoPage() {
  await requireStaffPortal();
  const db = getAdminDb();

  let rows: LocalSeoRow[] = [];
  try {
    const { data, error } = await db
      .from("landing_pages")
      .select("id,slug,city,title,status,meta_description")
      .order("city", { ascending: true });
    if (!error && data && data.length > 0) {
      rows = data as LocalSeoRow[];
    } else {
      rows = mockRows();
    }
  } catch {
    rows = mockRows();
  }

  const usingMock = rows.some((r) => r.id.startsWith("mock-"));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">Local SEO pages</h1>
        <p className="mt-2 max-w-2xl text-sm text-bark/80">
          Track Texas metro pages from planned → published. Approval required before publishing live routes.
        </p>
        {usingMock && (
          <p className="mt-2 text-sm text-amber-900">
            Showing curated preview list until <code className="rounded bg-white px-1">landing_pages</code> rows exist in Supabase.
          </p>
        )}
      </div>

      <CampaignAuthenticityCompact />

      <LocalSeoTable rows={rows} />

      <p className="text-xs text-bark/65">
        Preview links assume published slugs exist for curated cities (see{" "}
        <code className="rounded bg-white px-1">/texas/[city]</code>).
      </p>
    </div>
  );
}
