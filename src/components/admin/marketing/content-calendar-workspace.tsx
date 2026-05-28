"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export type ContentCalendarRow = {
  id: string;
  title: string;
  platform: string;
  status: string;
  publish_at: string | null;
  target_audience: string | null;
};

const nextStatus: Record<string, string | undefined> = {
  idea: "draft",
  draft: "approved",
  approved: "scheduled",
  scheduled: "published",
};

export function ContentCalendarWorkspace({ rows }: { rows: ContentCalendarRow[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("instagram");

  async function createIdea(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/marketing/content-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, platform }),
      });
      if (res.ok) {
        setTitle("");
        setShowForm(false);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function advanceStatus(id: string, current: string) {
    const next = nextStatus[current];
    if (!next) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/marketing/content-calendar/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New idea"}
        </Button>
        <Link
          href="/admin/marketing/content"
          className="inline-flex min-h-11 items-center rounded-full border border-sage/30 px-5 text-sm font-semibold text-forest hover:bg-cream/60"
        >
          Open Content Studio
        </Link>
      </div>

      {showForm && (
        <form onSubmit={createIdea} className="grid gap-3 rounded-2xl border border-sand bg-white p-4 md:grid-cols-[2fr_1fr_auto]">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title / idea" required />
          <select
            className="min-h-12 rounded-xl border border-sand px-3"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {["facebook", "instagram", "email", "blog", "google_business_profile", "other"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={busy}>
            Add
          </Button>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-sand bg-white shadow-sm">
        <table className="min-w-[880px] w-full text-left text-sm">
          <thead className="border-b border-sand bg-cream/60 text-forest">
            <tr>
              <th className="px-3 py-3 font-medium">Title</th>
              <th className="px-3 py-3 font-medium">Platform</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Publish at</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-bark/70">
                  No calendar posts yet. Add an idea to start the workflow.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-sand/70">
                <td className="px-3 py-3 font-medium text-forest">{row.title}</td>
                <td className="px-3 py-3">{row.platform}</td>
                <td className="px-3 py-3">
                  <Badge tone={row.status === "published" ? "success" : "sage"}>{row.status}</Badge>
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {row.publish_at ? new Date(row.publish_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-3 py-3">
                  {nextStatus[row.status] ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="!min-h-9 !text-xs"
                      disabled={busy}
                      onClick={() => void advanceStatus(row.id, row.status)}
                    >
                      → {nextStatus[row.status]}
                    </Button>
                  ) : (
                    <span className="text-xs text-bark/60">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
