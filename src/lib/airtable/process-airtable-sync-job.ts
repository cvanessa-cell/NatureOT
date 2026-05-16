import type { SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";
import { stripBlockedKeysDeep } from "@/lib/safety/minimum-necessary-filter";
import {
  mapInternalPayloadToAirtableFields,
  normalizeAirtableTargetKey,
} from "./airtable-field-mappers";
import { airtableCreateQueuedRecord } from "./airtable-client";
import { resolveAirtableTableIdForTarget } from "./resolve-airtable-table-id";

const META = new Set([
  "source_table",
  "source_record_id",
  "target_airtable_table",
  "_stripped_blocked_keys",
]);

export type ProcessJobsResult = {
  processed: number;
  succeeded: number;
  failed: number;
  skippedSyncDisabled: number;
  dryRun: boolean;
  /** Effective parallel worker count for this batch (1–batch size). */
  concurrency: number;
};

type PendingJobRow = {
  id: string;
  payload: unknown;
  target_airtable_table: string | null;
};

type SingleJobDelta = {
  processed: number;
  succeeded: number;
  failed: number;
  skippedSyncDisabled: number;
};

function clampConcurrency(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(Math.floor(n), 1), 25);
}

/**
 * Resolve how many jobs may run in parallel.
 * Precedence: explicit option → AIRTABLE_SYNC_CONCURRENCY → 1 (serial).
 */
export function resolveAirtableSyncConcurrency(
  option: number | undefined,
  envValue: string | undefined,
  batchSize: number
): number {
  let chosen: number;
  if (option !== undefined && Number.isFinite(option)) {
    chosen = clampConcurrency(option);
  } else if (envValue !== undefined && envValue.trim() !== "") {
    const parsed = parseInt(envValue, 10);
    chosen = Number.isFinite(parsed) ? clampConcurrency(parsed) : 1;
  } else {
    chosen = 1;
  }
  return Math.min(chosen, Math.max(batchSize, 1));
}

async function mapPool<T, R>(
  items: readonly T[],
  poolSize: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return [];
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const workers = Math.min(poolSize, items.length);

  const worker = async () => {
    for (;;) {
      const i = nextIndex++;
      if (i >= items.length) break;
      results[i] = await mapper(items[i]);
    }
  };

  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}

async function processOnePendingAirtableSyncJob(
  supabase: SupabaseClient,
  job: PendingJobRow,
  ctx: {
    effectiveDryRun: boolean;
    syncEnabled: boolean;
    hasCreds: boolean;
  }
): Promise<SingleJobDelta> {
  const jobId = job.id as string;
  const label = job.target_airtable_table as string | null;
  const tableId = resolveAirtableTableIdForTarget(label);

  const rawPayload =
    typeof job.payload === "object" && job.payload
      ? ({ ...(job.payload as Record<string, unknown>) } as Record<string, unknown>)
      : {};

  const { data: stripped, removedKeys } = stripBlockedKeysDeep(rawPayload);
  const sanitized: Record<string, unknown> = { ...stripped };
  for (const k of META) {
    delete sanitized[k];
  }
  delete sanitized._stripped_blocked_keys;

  const normalizedTarget = normalizeAirtableTargetKey(label);
  const mapped = mapInternalPayloadToAirtableFields(normalizedTarget, sanitized);

  const processorMeta = {
    target_label: label ?? null,
    normalized_target: normalizedTarget,
    resolved_table_id_present: Boolean(tableId),
    effective_dry_run: ctx.effectiveDryRun,
    worker_stripped_extra_count: removedKeys.length,
  };

  if (!mapped.ok) {
    await supabase
      .from("airtable_sync_jobs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error_message: mapped.error.slice(0, 2000),
        payload: {
          ...rawPayload,
          _processor: {
            error: mapped.error,
            at: new Date().toISOString(),
            ...processorMeta,
          },
        },
      })
      .eq("id", jobId);
    return { processed: 1, succeeded: 0, failed: 1, skippedSyncDisabled: 0 };
  }

  const airtableFields = mapped.fields;
  if (Object.keys(airtableFields).length === 0) {
    await supabase
      .from("airtable_sync_jobs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error_message: "mapped_fields_empty",
        payload: {
          ...rawPayload,
          _processor: {
            error: "mapped_fields_empty",
            dropped_internal_keys: mapped.droppedKeys,
            at: new Date().toISOString(),
            ...processorMeta,
          },
        },
      })
      .eq("id", jobId);
    return { processed: 1, succeeded: 0, failed: 1, skippedSyncDisabled: 0 };
  }

  if (ctx.effectiveDryRun) {
    await supabase
      .from("airtable_sync_jobs")
      .update({
        status: "completed",
        finished_at: new Date().toISOString(),
        error_message: null,
        payload: {
          ...rawPayload,
          _processor: {
            mode: "dry_run",
            finished_at: new Date().toISOString(),
            mapped_airtable_fields: airtableFields,
            dropped_internal_keys: mapped.droppedKeys,
            ...processorMeta,
          },
        },
      })
      .eq("id", jobId);
    return { processed: 1, succeeded: 1, failed: 0, skippedSyncDisabled: 0 };
  }

  if (!ctx.syncEnabled || !ctx.hasCreds) {
    await supabase
      .from("airtable_sync_jobs")
      .update({
        status: "pending",
        started_at: null,
        payload: {
          ...rawPayload,
          _processor: {
            skipped: "sync_disabled_or_missing_airtable_credentials",
            mapped_airtable_fields_preview: airtableFields,
            at: new Date().toISOString(),
          },
        },
      })
      .eq("id", jobId);
    return { processed: 1, succeeded: 0, failed: 0, skippedSyncDisabled: 1 };
  }

  if (!tableId) {
    await supabase
      .from("airtable_sync_jobs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error_message: "missing_airtable_table_id_mapping",
        payload: {
          ...rawPayload,
          _processor: {
            error: "unmapped_target",
            label,
            mapped_airtable_fields: airtableFields,
            at: new Date().toISOString(),
          },
        },
      })
      .eq("id", jobId);
    return { processed: 1, succeeded: 0, failed: 1, skippedSyncDisabled: 0 };
  }

  const nowIso = new Date().toISOString();
  await supabase
    .from("airtable_sync_jobs")
    .update({
      status: "running",
      started_at: nowIso,
    })
    .eq("id", jobId);

  const result = await airtableCreateQueuedRecord(tableId, airtableFields);
  if (!result.ok) {
    await supabase
      .from("airtable_sync_jobs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error_message: result.message.slice(0, 2000),
        payload: {
          ...rawPayload,
          _processor: {
            http_status: result.status,
            mapped_airtable_field_keys: Object.keys(airtableFields),
            at: new Date().toISOString(),
          },
        },
      })
      .eq("id", jobId);
    return { processed: 1, succeeded: 0, failed: 1, skippedSyncDisabled: 0 };
  }

  await supabase
    .from("airtable_sync_jobs")
    .update({
      status: "completed",
      finished_at: new Date().toISOString(),
      error_message: null,
      payload: {
        ...rawPayload,
        _processor: {
          mode: "live",
          airtable_record_id: result.recordId ?? null,
          mapped_airtable_field_keys: Object.keys(airtableFields),
          at: new Date().toISOString(),
        },
      },
    })
    .eq("id", jobId);
  return { processed: 1, succeeded: 1, failed: 0, skippedSyncDisabled: 0 };
}

function sumDeltas(deltas: SingleJobDelta[]): Omit<ProcessJobsResult, "dryRun" | "concurrency"> {
  return deltas.reduce(
    (acc, d) => ({
      processed: acc.processed + d.processed,
      succeeded: acc.succeeded + d.succeeded,
      failed: acc.failed + d.failed,
      skippedSyncDisabled: acc.skippedSyncDisabled + d.skippedSyncDisabled,
    }),
    { processed: 0, succeeded: 0, failed: 0, skippedSyncDisabled: 0 }
  );
}

/**
 * Worker entry: pending airtable_sync_jobs → dry-run finalize or outbound create.
 * PHI-like keys stripped again before outbound; `_stripped_blocked_keys` never sent upstream.
 */
export async function processPendingAirtableSyncJobs(options: {
  supabase: SupabaseClient;
  limit: number;
  requestDryRun?: boolean;
  /** When set, only these pending job ids are considered (FIFO within the set). */
  jobIds?: string[];
  /**
   * Parallel workers for this batch (capped at batch size and 25).
   * Falls back to `AIRTABLE_SYNC_CONCURRENCY` then 1.
   */
  concurrency?: number;
}): Promise<ProcessJobsResult> {
  const env = getEnv();
  const envDry = env.AIRTABLE_DRY_RUN === "true";
  const effectiveDryRun = envDry || options.requestDryRun === true;
  const syncEnabled = env.AIRTABLE_SYNC_ENABLED === "true";
  const hasCreds = Boolean(env.AIRTABLE_API_KEY && env.AIRTABLE_BASE_ID);

  let jobQuery = options.supabase
    .from("airtable_sync_jobs")
    .select("id, payload, target_airtable_table, status")
    .eq("status", "pending");

  if (options.jobIds?.length) {
    jobQuery = jobQuery.in("id", options.jobIds);
  }

  const { data: jobs, error } = await jobQuery
    .order("created_at", { ascending: true })
    .limit(options.limit);

  if (error) throw error;

  const list = (jobs ?? []) as PendingJobRow[];
  if (list.length === 0) {
    return {
      processed: 0,
      succeeded: 0,
      failed: 0,
      skippedSyncDisabled: 0,
      dryRun: effectiveDryRun,
      concurrency: 1,
    };
  }

  const concurrency = resolveAirtableSyncConcurrency(
    options.concurrency,
    env.AIRTABLE_SYNC_CONCURRENCY,
    list.length
  );

  const ctx = { effectiveDryRun, syncEnabled, hasCreds };

  const deltas = await mapPool(list, concurrency, (job) =>
    processOnePendingAirtableSyncJob(options.supabase, job, ctx)
  );

  const totals = sumDeltas(deltas);
  return {
    ...totals,
    dryRun: effectiveDryRun,
    concurrency,
  };
}
