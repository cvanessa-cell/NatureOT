import { requireStaffPortal } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { texasCitiesSeo } from "@/lib/mock/admin-sample-data";
import { Badge } from "@/components/ui/badge";
import { CampaignAuthenticityCompact } from "@/components/admin/campaign-authenticity-rules";

export const metadata: Metadata = {
  title: "Local SEO | Nature OT Growth OS",
};

export default async function AdminLocalSeoPage() {
  await requireStaffPortal();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
          Local SEO pages
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-bark/80">
          Track Texas metro pages from planned → published. Approval required before publishing live routes.
        </p>
      </div>

      <CampaignAuthenticityCompact />

      <div className="overflow-x-auto rounded-2xl border border-sand bg-white shadow-sm">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="border-b border-sand bg-cream/60 text-forest">
            <tr>
              <th className="px-3 py-3 font-medium">City</th>
              <th className="px-3 py-3 font-medium">Primary keyword</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Preview</th>
            </tr>
          </thead>
          <tbody>
            {texasCitiesSeo.map((row) => (
              <tr key={row.city} className="border-t border-sand/70">
                <td className="px-3 py-3 font-medium">{row.city}</td>
                <td className="px-3 py-3">{row.keyword}</td>
                <td className="px-3 py-3">
                  <Badge
                    tone={
                      row.status === "Published"
                        ? "success"
                        : row.status === "Needs Review"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {row.status}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/texas/${row.slug}`}
                    className="inline-flex min-h-9 items-center justify-center rounded-full border-2 border-sage/40 px-3 text-xs font-medium text-forest hover:bg-cream/60"
                  >
                    Preview page
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-bark/65">
        Preview links assume published slugs exist for curated cities (see <code className="rounded bg-white px-1">/texas/[city]</code>).
      </p>
    </div>
  );
}
