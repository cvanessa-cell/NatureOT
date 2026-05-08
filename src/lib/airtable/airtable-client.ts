import { airtableRequest } from "./client";

export type AirtableFields = Record<string, unknown>;

/**
 * Queue worker create — mirrors waitlist POST shape (`records: [{ fields }]`).
 * Table IDs stay server-side in env vars.
 */
export async function airtableCreateQueuedRecord(tableId: string, fields: AirtableFields): Promise<
  | { ok: true; recordId?: string }
  | { ok: false; status: number; message: string }
> {
  const res = await airtableRequest<{ records?: { id: string }[] }>({
    method: "POST",
    path: `/${encodeURIComponent(tableId)}`,
    body: { records: [{ fields }] },
  });

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: truncate(res.body, 900),
    };
  }

  const recordId = res.data.records?.[0]?.id;
  return { ok: true, recordId };
}

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}
