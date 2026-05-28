"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type TestimonialRow = {
  id: string;
  quote: string;
  parent_initials: string;
  auth_status: string;
  admin_approval: string;
  published: boolean;
};

export function TestimonialsQueue({ rows }: { rows: TestimonialRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    try {
      await fetch(`/api/admin/marketing/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <Card>
        <p className="text-sm text-bark/80">
          No testimonials in queue. Run migration <code className="rounded bg-white px-1">009_testimonials</code> on Supabase to enable this table.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((r) => {
        const canPublish = r.auth_status === "authorized" && r.admin_approval === "approved";
        return (
          <Card key={r.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-medium text-bark/70">Quote</p>
                <blockquote className="mt-1 text-base text-forest">&ldquo;{r.quote}&rdquo;</blockquote>
                <p className="mt-2 text-xs text-bark/60">Initials: {r.parent_initials}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={r.auth_status === "authorized" ? "success" : "warning"}>
                  Auth: {r.auth_status}
                </Badge>
                <Badge tone={r.admin_approval === "approved" ? "success" : "neutral"}>
                  Admin: {r.admin_approval}
                </Badge>
                {r.published && <Badge tone="success">Published</Badge>}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-sand pt-4">
              {!canPublish && !r.published && (
                <p className="text-sm font-medium text-amber-900">
                  Publish disabled until authorization + admin approval are complete.
                </p>
              )}
              <Button
                type="button"
                disabled={!canPublish || r.published || busyId === r.id}
                onClick={() => void patch(r.id, { published: true })}
              >
                Publish to site
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busyId === r.id}
                onClick={() => void patch(r.id, { authStatus: "authorized" })}
              >
                Mark authorized
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busyId === r.id}
                onClick={() => void patch(r.id, { adminApproval: "approved" })}
              >
                Admin approve
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
