import type { SupabaseClient } from "@supabase/supabase-js";
import { processPendingAirtableSyncJobs } from "./process-airtable-sync-job";

export type RetryFailedJobsMode = "reset_only" | "process_now";

export type RetryFailedAirtableJobsResult = {
  ok: boolean;
  mode: RetryFailedJobsMode;
  dryRun: boolean;
  /** Rows matched as failed candidates for this batch. */
  selected: number;
  /** Rows moved back to pending (requires DB write). */
  reset: number;
  processed?: number;
  succeeded?: number;
  failed?: number;
  skippedSyncDisabled?: number;
  processorDryRun?: boolean;
  error?: string;
};

async function fetchFailedJobs(
  supabase: SupabaseClient,
  limit: number
): Promise<{ id: string; error_message: string | null; retry_count: number | null; retry_metadata: unknown }[]> {
  const { data, error } = await supabase
    .from("airtable_sync_jobs")
    .select("id, error_message, retry_count, retry_metadata")
    .eq("status", "failed")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as {
    id: string;
    error_message: string | null;
    retry_count: number | null;
    retry_metadata: unknown;
  }[];
}

/**
 * Staff-only helper: reset failed airtable_sync_jobs to pending (+ audit metadata),
 * optionally run the processor on just those ids.
 */
export async function retryFailedAirtableJobs(options: {
  supabase: SupabaseClient;
  limit: number;
  dryRun: boolean;
  mode: RetryFailedJobsMode;
}): Promise<RetryFailedAirtableJobsResult> {
  const mode = options.mode ?? "reset_only";
  const dryRun = Boolean(options.dryRun);
  const lim = Math.min(Math.max(Number(options.limit) || 10, 1), 75);

  const rows = await fetchFailedJobs(options.supabase, lim);
  const ids = rows.map((r) => r.id);

  if (rows.length === 0) {
    return {
      ok: true,
      mode,
      dryRun,
      selected: 0,
      reset: 0,
    };
  }

  if (dryRun && mode === "reset_only") {
    return {
      ok: true,
      mode,
      dryRun,
      selected: ids.length,
      reset: 0,
    };
  }

  const shouldWriteReset = mode === "process_now" || !dryRun;
  const nowIso = new Date().toISOString();
  let resetCount = 0;

  if (shouldWriteReset) {
    for (const row of rows) {
      const existingMeta =
        typeof row.retry_metadata === "object" && row.retry_metadata !== null
          ? { ...(row.retry_metadata as Record<string, unknown>) }
          : {};
      const prev = Array.isArray(existingMeta.previous_errors)
        ? [...(existingMeta.previous_errors as unknown[])]
        : [];
      prev.push({
        at: nowIso,
        message: row.error_message ?? "(no message)",
      });
      existingMeta.previous_errors = prev.slice(-20);
      existingMeta.previous_error_snapshot = row.error_message;
      existingMeta.last_reset_at = nowIso;

      const { error: upErr } = await options.supabase
        .from("airtable_sync_jobs")
        .update({
          status: "pending",
          error_message: null,
          finished_at: null,
          started_at: null,
          retry_count: (row.retry_count ?? 0) + 1,
          last_retry_at: nowIso,
          retry_metadata: existingMeta,
        })
        .eq("id", row.id);

      if (!upErr) resetCount++;
    }
  }

  if (mode === "reset_only") {
    return {
      ok: true,
      mode,
      dryRun,
      selected: ids.length,
      reset: resetCount,
    };
  }

  const proc = await processPendingAirtableSyncJobs({
    supabase: options.supabase,
    limit: Math.max(ids.length, 1),
    requestDryRun: dryRun,
    jobIds: ids,
  });

  return {
    ok: true,
    mode,
    dryRun,
    selected: ids.length,
    reset: resetCount,
    processed: proc.processed,
    succeeded: proc.succeeded,
    failed: proc.failed,
    skippedSyncDisabled: proc.skippedSyncDisabled,
    processorDryRun: proc.dryRun,
  };
}
