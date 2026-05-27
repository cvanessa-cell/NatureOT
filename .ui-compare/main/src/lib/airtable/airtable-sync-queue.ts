import { createAdminClient } from "@/lib/supabase/admin";
import { excludeFreeTextNotes, stripBlockedKeysDeep } from "@/lib/safety/minimum-necessary-filter";

export type EnqueueAirtablePushInput = {
  sourceTable: string;
  sourceRecordId: string;
  targetAirtableTable: string;
  /** Minimum-necessary JSON for worker; PHI-like keys stripped before stored. */
  safePayloadSummary: Record<string, unknown>;
  dryRun?: boolean;
};

/** Inserts airtable_sync_jobs row for background worker — never blocks on PAT. */
export async function enqueueAirtablePush(
  input: EnqueueAirtablePushInput
): Promise<{ id: string | null; error?: string }> {
  const supabase = createAdminClient();

  const { data: stripped, removedKeys } = stripBlockedKeysDeep(
    excludeFreeTextNotes(input.safePayloadSummary)
  );
  if (removedKeys.length) {
    stripped._stripped_blocked_keys = removedKeys;
  }

  const payload = {
    ...stripped,
    source_table: input.sourceTable,
    source_record_id: input.sourceRecordId,
    target_airtable_table: input.targetAirtableTable,
  };

  const { data, error } = await supabase
    .from("airtable_sync_jobs")
    .insert({
      job_type: `${input.sourceTable}_enqueue`,
      direction: "push",
      dry_run: input.dryRun ?? false,
      status: "pending",
      payload,
      source_table: input.sourceTable,
      source_record_id: input.sourceRecordId,
      target_airtable_table: input.targetAirtableTable,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[airtable_sync_jobs]", error.message);
    return { id: null, error: error.message };
  }
  return { id: data?.id as string };
}
