import { createAdminClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";
import { writeAuditLog } from "@/lib/audit";
import { airtableRequest } from "@/lib/airtable/client";
import { filterForAirtableWaitlist } from "@/lib/airtable/phi-filter";
import {
  mapWaitlistRowToAirtable,
  WAITLIST_AIRTABLE_ALLOWLIST,
} from "@/lib/airtable/mappers/waitlist";
import type { SupabaseClient } from "@supabase/supabase-js";

type AirtableListResponse = { records: { id: string; fields: Record<string, unknown> }[] };

export async function pushWaitlistToAirtable(options: {
  dryRun: boolean;
  waitlistId?: string;
  jobId: string;
  supabase?: SupabaseClient;
}): Promise<{
  pushed: number;
  errors: string[];
  events: { entityId: string; success: boolean; error?: string; snapshot?: unknown }[];
}> {
  const env = getEnv();
  const tableId = env.AIRTABLE_WAITLIST_TABLE_ID;
  if (!tableId) {
    throw new Error("AIRTABLE_WAITLIST_TABLE_ID is not set");
  }

  const supabase = options.supabase ?? createAdminClient();
  const errors: string[] = [];
  const events: {
    entityId: string;
    success: boolean;
    error?: string;
    snapshot?: unknown;
  }[] = [];
  let pushed = 0;

  let q = supabase
    .from("waitlist_entries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (options.waitlistId) {
    q = q.eq("id", options.waitlistId);
  }
  const { data: rows, error: qe } = await q;
  if (qe) throw qe;

  for (const row of rows ?? []) {
    const mapped = mapWaitlistRowToAirtable(row as never);
    const filtered = filterForAirtableWaitlist(mapped, [...WAITLIST_AIRTABLE_ALLOWLIST]);
    if (!filtered.ok) {
      errors.push(`${row.id}: ${filtered.reason}`);
      await recordSyncEvent(options.jobId, row.id, false, {
        reason: filtered.reason,
        stripped: filtered.strippedKeys,
      }, filtered.reason);
      events.push({ entityId: row.id, success: false, error: filtered.reason });
      continue;
    }

    const fields = filtered.data;
    if (options.dryRun) {
      pushed++;
      await recordSyncEvent(options.jobId, row.id, true, fields, undefined);
      events.push({ entityId: row.id, success: true, snapshot: fields });
      continue;
    }

    const existing = row.airtable_record_id as string | null;
    let path: string;
    let method: "PATCH" | "POST";
    let body: unknown;

    if (existing) {
      path = `/${encodeURIComponent(tableId)}/${encodeURIComponent(existing)}`;
      method = "PATCH";
      body = { fields };
    } else {
      path = `/${encodeURIComponent(tableId)}`;
      method = "POST";
      body = { records: [{ fields }] };
    }

    const res = await airtableRequest<{ records?: { id: string }[]; id?: string }>({
      method,
      path,
      body,
    });

    if (!res.ok) {
      errors.push(`${row.id}: ${res.body}`);
      await recordSyncEvent(options.jobId, row.id, false, fields, res.body);
      events.push({ entityId: row.id, success: false, error: res.body });
      continue;
    }

    let airtableId = existing;
    if (method === "POST") {
      const created = (res.data as { records?: { id: string }[] }).records?.[0];
      airtableId = created?.id ?? null;
    }

    if (airtableId) {
      await supabase
        .from("waitlist_entries")
        .update({
          airtable_record_id: airtableId,
          last_airtable_sync_at: new Date().toISOString(),
        })
        .eq("id", row.id);
    }

    pushed++;
    await recordSyncEvent(options.jobId, row.id, true, fields, undefined);
    events.push({ entityId: row.id, success: true, snapshot: fields });
  }

  await writeAuditLog({
    action: "airtable_push_waitlist",
    resourceType: "airtable_sync_jobs",
    resourceId: options.jobId,
    details: { dryRun: options.dryRun, pushed },
  });

  return { pushed, errors, events };
}

async function recordSyncEvent(
  jobId: string,
  entityId: string,
  success: boolean,
  snapshot: unknown,
  errorMessage?: string
) {
  const supabase = createAdminClient();
  await supabase.from("airtable_sync_events").insert({
    job_id: jobId,
    entity_type: "waitlist_entries",
    entity_id: entityId,
    direction: "push",
    payload_snapshot: snapshot as never,
    success,
    error_message: errorMessage ?? null,
  });
}

/** Pull is optional MVP — lists Airtable records for reconciliation without merging PHI. */
export async function listAirtableWaitlistPreview(): Promise<
  | { ok: true; count: number }
  | { ok: false; error: string }
> {
  const env = getEnv();
  const tableId = env.AIRTABLE_WAITLIST_TABLE_ID;
  if (!tableId) {
    return { ok: false, error: "AIRTABLE_WAITLIST_TABLE_ID missing" };
  }
  const res = await airtableRequest<AirtableListResponse>({
    method: "GET",
    path: `/${encodeURIComponent(tableId)}?maxRecords=20`,
  });
  if (!res.ok) return { ok: false, error: res.body };
  return { ok: true, count: res.data.records?.length ?? 0 };
}
