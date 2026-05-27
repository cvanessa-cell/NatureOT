"use client";

import { useState } from "react";

export function AirtableSyncPanel() {
  const [log, setLog] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function run(opts: { dryRun: boolean; direction: "push" | "pull" }) {
    setLoading(true);
    setLog("");
    const res = await fetch("/api/admin/airtable-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: "waitlist",
        direction: opts.direction,
        dryRun: opts.dryRun,
      }),
    });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    setLog(JSON.stringify(j, null, 2));
  }

  return (
    <div className="space-y-4 rounded-2xl border border-sand bg-white/80 p-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading}
          className="min-h-12 rounded-full bg-sage px-6 text-cream"
          onClick={() => void run({ dryRun: true, direction: "push" })}
        >
          Dry-run push (waitlist)
        </button>
        <button
          type="button"
          disabled={loading}
          className="min-h-12 rounded-full bg-forest px-6 text-cream"
          onClick={() => void run({ dryRun: false, direction: "push" })}
        >
          Sync to Airtable
        </button>
        <button
          type="button"
          disabled={loading}
          className="min-h-12 rounded-full border border-sage px-6 text-forest"
          onClick={() => void run({ dryRun: true, direction: "pull" })}
        >
          Pull preview (count)
        </button>
      </div>
      <p className="text-xs text-bark/70">
        Requires privileged login. Background queues can poll{" "}
        <code className="rounded bg-cream px-1">airtable_sync_jobs</code> later — MVP runs
        synchronously.
      </p>
      {log && (
        <pre className="max-h-96 overflow-auto rounded-xl bg-cream/50 p-4 text-xs">
          {log}
        </pre>
      )}
    </div>
  );
}
