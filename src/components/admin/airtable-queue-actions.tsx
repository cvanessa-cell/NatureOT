"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function AirtableQueueActions({
  envSyncEnabledHint,
  envDryHint,
  failedFilterActive,
}: {
  envSyncEnabledHint: string;
  envDryHint: string;
  failedFilterActive?: boolean;
}) {
  const [log, setLog] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function runProcessPending(limit: number, dryRun: boolean) {
    setLoading(true);
    setLog("");
    try {
      const res = await fetch("/api/admin/airtable/process-pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit, dryRun }),
      });
      const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      setLog(JSON.stringify({ action: "process-pending", status: res.status, body: j }, null, 2));
    } catch (e) {
      setLog(e instanceof Error ? e.message : "request_failed");
    } finally {
      setLoading(false);
    }
  }

  async function runRetry(limit: number, dryRun: boolean, mode: "reset_only" | "process_now") {
    setLoading(true);
    setLog("");
    try {
      const res = await fetch("/api/admin/airtable/retry-failed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit, dryRun, mode }),
      });
      const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      setLog(JSON.stringify({ action: "retry-failed", status: res.status, body: j }, null, 2));
    } catch (e) {
      setLog(e instanceof Error ? e.message : "request_failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-sage/30 bg-white/90 p-4 shadow-sm space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="font-semibold text-forest">Growth OS queue processor</h2>
          <p className="text-xs text-bark/70">
            Honors <code>AIRTABLE_SYNC_ENABLED</code> ({envSyncEnabledHint}) and{" "}
            <code>AIRTABLE_DRY_RUN</code> ({envDryHint}). Buttons are explicit — cron is optional behind{" "}
            <code>/api/cron/process-airtable-sync</code>.
          </p>
          {failedFilterActive && (
            <p className="mt-2 text-[11px] font-medium text-moss">
              Viewing failed rows only — Retry actions below operate on earliest failed jobs globally.
            </p>
          )}
        </div>
        <Link
          href={failedFilterActive ? "/admin/airtable" : "/admin/airtable?failed=1"}
          className={cn(
            "inline-flex min-h-10 items-center rounded-full border-2 border-sage/40 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-forest hover:border-sage hover:bg-cream/60"
          )}
        >
          {failedFilterActive ? "Show all jobs" : "View failed only"}
        </Link>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-bark/60">Process pending</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={loading} onClick={() => void runProcessPending(10, true)}>
            Dry-run process (≤10)
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => void runProcessPending(10, false)}
          >
            Process pending (≤10)
          </Button>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-bark/60">Retry failed</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={loading} onClick={() => void runRetry(10, true, "reset_only")}>
            Dry-run retry (preview count)
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => void runRetry(10, false, "reset_only")}
          >
            Retry failed → pending
          </Button>
          <Button type="button" variant="outline" disabled={loading} onClick={() => void runRetry(10, true, "process_now")}>
            Dry-run retry + process
          </Button>
          <Button
            type="button"
            variant="terracotta"
            disabled={loading}
            onClick={() => void runRetry(10, false, "process_now")}
          >
            Retry + process now (live*)
          </Button>
        </div>
        <p className="mt-2 text-[10px] text-bark/65">
          Reset-only increments <code>retry_count</code>, stamps <code>last_retry_at</code>, and preserves prior errors
          under <code>retry_metadata</code>. Process-now scopes the worker to the batch that was just reset.
        </p>
      </div>

      {log && (
        <pre className="max-h-80 overflow-auto rounded-xl bg-cream/50 p-3 text-[11px] text-forest">{log}</pre>
      )}
    </div>
  );
}
