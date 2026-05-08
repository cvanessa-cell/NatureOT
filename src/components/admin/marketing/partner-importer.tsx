"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PartnerImporter() {
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function run(dryRun: boolean) {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/marketing/partners/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, dryRun }),
      });
      const j = await res.json().catch(() => ({}));
      setResult({ ok: res.ok, ...j });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="grid gap-2 text-sm font-medium text-forest">
        Paste CSV
        <textarea
          className="min-h-[240px] w-full rounded-xl border border-sand bg-white/90 p-3 font-mono text-xs"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder="name,category,website,email,phone,city,county,..."
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={busy || !csv.trim()} onClick={() => void run(true)}>
          Dry run
        </Button>
        <Button type="button" disabled={busy || !csv.trim()} onClick={() => void run(false)}>
          Import
        </Button>
        <a
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-sage/30 px-5 text-sm font-semibold text-forest hover:bg-cream/60"
          href="/api/admin/marketing/partners/export"
        >
          Export CSV
        </a>
      </div>
      {result && (
        <pre className="overflow-x-auto rounded-xl border border-sand bg-white/80 p-3 text-xs text-bark">
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

