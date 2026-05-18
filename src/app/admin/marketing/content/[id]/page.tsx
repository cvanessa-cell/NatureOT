import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Content asset | TreeTots Growth Engine",
};

export const dynamic = "force-dynamic";

type ContentAssetDetail = {
  id: string;
  title: string;
  asset_type: string;
  channel: string | null;
  audience: string | null;
  status: string;
  compliance_status: string;
  body: string | null;
  notes: string | null;
};

export default async function ContentAssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffPortal();
  const { id } = await params;
  const db = getAdminDb();

  const { data } = await db
    .from("content_assets")
    .select("id,title,asset_type,channel,audience,status,compliance_status,body,notes")
    .eq("id", id)
    .maybeSingle();

  const a = (data as unknown as ContentAssetDetail | null) ?? null;

  if (!a) {
    return (
      <Card>
        <p className="text-sm text-bark/80">Content asset not found.</p>
        <Link href="/admin/marketing/content" className="mt-4 inline-flex">
          <Button type="button" variant="outline">
            Back
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-moss">Content asset</p>
        <h1 className="mt-2 font-display text-3xl text-forest">
          {a.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-bark/80">
          <span>{a.asset_type}</span>
          {a.channel ? <span>· {a.channel}</span> : null}
          <Badge tone={a.status.includes("review") ? "warning" : "sage"}>{a.status}</Badge>
          <Badge
            tone={
              a.compliance_status === "approved"
                ? "success"
                : a.compliance_status === "high_risk" || a.compliance_status === "do_not_use"
                  ? "danger"
                  : "warning"
            }
          >
            {a.compliance_status}
          </Badge>
        </div>
      </div>

      <Card>
        <p className="text-sm font-medium text-forest">Body</p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-bark/85">{a.body ?? "—"}</p>
      </Card>

      <Card>
        <p className="text-sm font-medium text-forest">Next actions</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/marketing/compliance">
            <Button type="button" variant="outline">
              Run compliance check
            </Button>
          </Link>
          <Button type="button" disabled>
            Approve & schedule (next)
          </Button>
        </div>
      </Card>

      <Link href="/admin/marketing/content" className="inline-flex">
        <Button type="button" variant="outline">
          Back to content
        </Button>
      </Link>
    </div>
  );
}

