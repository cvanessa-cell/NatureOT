"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type LeadRow = {
  id: string;
  name: string;
  email: string;
  city: string;
  source: string;
  status: string;
  interest: string;
  booking: string;
  created: string;
};

export function LeadsTable({ rows }: { rows: LeadRow[] }) {
  const [q, setQ] = useState("");
  const [source, setSource] = useState<string>("all");

  const sources = useMemo(() => {
    const s = new Set(rows.map((r) => r.source));
    return ["all", ...Array.from(s)];
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okSource = source === "all" || r.source === source;
      const hay = `${r.name} ${r.email} ${r.city} ${r.interest}`.toLowerCase();
      const okQ = !q.trim() || hay.includes(q.toLowerCase());
      return okSource && okQ;
    });
  }, [rows, q, source]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <label className="grid max-w-md gap-1 text-sm font-medium text-forest">
          Search
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, email, city, interest"
            aria-label="Search leads"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-forest">
          Source
          <select
            className="min-h-12 rounded-xl border border-sand bg-white px-3"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            {sources.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All sources" : s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-sand bg-white shadow-sm">
        <table className="min-w-[880px] w-full text-left text-sm">
          <thead className="border-b border-sand bg-cream/60 text-forest">
            <tr>
              <th className="px-3 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Email</th>
              <th className="px-3 py-3 font-medium">City</th>
              <th className="px-3 py-3 font-medium">Source</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Interest</th>
              <th className="px-3 py-3 font-medium">Booking</th>
              <th className="px-3 py-3 font-medium">Created</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-8 text-bark/70" colSpan={9}>
                  No rows match your filters.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-sand/70">
                <td className="px-3 py-3">{r.name}</td>
                <td className="px-3 py-3">{r.email}</td>
                <td className="px-3 py-3">{r.city}</td>
                <td className="px-3 py-3">{r.source}</td>
                <td className="px-3 py-3">
                  <Badge tone="sage">{r.status}</Badge>
                </td>
                <td className="px-3 py-3">{r.interest}</td>
                <td className="px-3 py-3">{r.booking}</td>
                <td className="px-3 py-3 tabular-nums text-bark/80">
                  {new Date(r.created).toLocaleString()}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="!min-h-9 !px-3 !py-1 !text-xs">
                      Contacted
                    </Button>
                    <Button type="button" variant="ghost" className="!min-h-9 !px-3 !py-1 !text-xs">
                      Booking link
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-bark/65">
        Actions are UI placeholders—wire to your CRM rules and consent preferences.
      </p>
    </div>
  );
}
