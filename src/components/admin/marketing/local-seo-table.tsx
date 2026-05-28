"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type LocalSeoRow = {
  id: string;
  slug: string;
  city: string;
  title: string;
  status: string;
  meta_description: string | null;
};

const statusTone = (status: string) => {
  if (status === "published") return "success";
  if (status === "reviewed" || status === "approved") return "warning";
  return "neutral";
};

const nextStatus: Record<string, string | undefined> = {
  planned: "generated",
  generated: "reviewed",
  reviewed: "approved",
  approved: "published",
};

export function LocalSeoTable({ rows }: { rows: LocalSeoRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function advance(id: string, current: string) {
    const next = nextStatus[current];
    if (!next) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/marketing/local-seo/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-bark/75">
        No landing pages in Supabase yet. Seed <code className="rounded bg-white px-1">landing_pages</code> or use city routes under{" "}
        <code className="rounded bg-white px-1">/texas/[city]</code>.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-sand bg-white shadow-sm">
      <table className="min-w-[900px] w-full text-left text-sm">
        <thead className="border-b border-sand bg-cream/60 text-forest">
          <tr>
            <th className="px-3 py-3 font-medium">City</th>
            <th className="px-3 py-3 font-medium">Primary keyword / title</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Preview</th>
            <th className="px-3 py-3 font-medium">Workflow</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-sand/70">
              <td className="px-3 py-3 font-medium">{row.city}</td>
              <td className="px-3 py-3">{row.meta_description ?? row.title}</td>
              <td className="px-3 py-3">
                <Badge tone={statusTone(row.status)}>{row.status}</Badge>
              </td>
              <td className="px-3 py-3">
                <Link
                  href={`/texas/${row.slug}`}
                  className="inline-flex min-h-9 items-center justify-center rounded-full border-2 border-sage/40 px-3 text-xs font-medium text-forest hover:bg-cream/60"
                >
                  Preview page
                </Link>
              </td>
              <td className="px-3 py-3">
                {row.id.startsWith("mock-") ? (
                  <span className="text-xs text-bark/60">Preview only</span>
                ) : nextStatus[row.status] ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="!min-h-9 !text-xs"
                    disabled={busyId === row.id}
                    onClick={() => void advance(row.id, row.status)}
                  >
                    → {nextStatus[row.status]}
                  </Button>
                ) : (
                  <span className="text-xs text-bark/60">Live</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
