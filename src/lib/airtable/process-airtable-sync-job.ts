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
};

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
}): Promise<ProcessJobsResult> {
  const env = getEnv();
  const envDry = env.AIRTABLE_DRY_RUN === "true";
  const effectiveDryRun = envDry || options.requestDryRun === true;
  const syncEnabled = env.AIRTABLE_SYNC_ENABLED === "true";
  const hasCreds = Boolean(env.AIRTABLE_API_KEY && env.AIRTABLE_BASE_ID);

  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  let skippedSyncDisabled = 0;

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

  for (const job of jobs ?? []) {
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
      effective_dry_run: effectiveDryRun,
      worker_stripped_extra_count: removedKeys.length,
    };

    if (!mapped.ok) {
      processed++;
      failed++;
      await options.supabase
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
      continue;
    }

    const airtableFields = mapped.fields;
    if (Object.keys(airtableFields).length === 0) {
      processed++;
      failed++;
      await options.supabase
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
      continue;
    }

    if (effectiveDryRun) {
      processed++;
      await options.supabase
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
      succeeded++;
      continue;
    }

    if (!syncEnabled || !hasCreds) {
      processed++;
      skippedSyncDisabled++;
      await options.supabase
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
      continue;
    }

    if (!tableId) {
      processed++;
      failed++;
      await options.supabase
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
      continue;
    }

    processed++;
    const nowIso = new Date().toISOString();
    await options.supabase
      .from("airtable_sync_jobs")
      .update({
        status: "running",
        started_at: nowIso,
      })
      .eq("id", jobId);

    const result = await airtableCreateQueuedRecord(tableId, airtableFields);
    if (!result.ok) {
      failed++;
      await options.supabase
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
      continue;
    }

    succeeded++;
    await options.supabase
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
  }

  return { processed, succeeded, failed, skippedSyncDisabled, dryRun: effectiveDryRun };
}
