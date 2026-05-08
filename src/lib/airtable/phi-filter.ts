/**
 * PHI / minimum-necessary filter before ANY outbound payload to Airtable.
 * Marketing ops must never sync clinical notes, diagnosis, full DOB, insurance,
 * child identifying PHI, or evaluation artifacts.
 *
 * Block keys matching these patterns (case-insensitive substring match).
 */
const BLOCKED_KEY_PATTERNS =
  /diagnosis|medical|clinical_note|progress|evaluation|insurance|subscriber|mrn|ssn|treatment_plan|medication|phi/i;

/** Blocks common PHI-bearing field names from slipping through. */
const BLOCKED_VALUE_PATTERNS =
  /\b(icd|dsm|cpt\s*\d|policy\s*number|subscriber\s*id|social\s*security)\b/i;

export type PhiFilterResult<T> =
  | { ok: true; data: T; strippedKeys: string[]; blockedReason?: undefined }
  | { ok: false; reason: string; strippedKeys: string[] };

/**
 * Allowlist-only mapping for waitlist-style operational mirrors.
 * Merge your real Airtable column titles in `mappers/waitlist.ts`.
 */
export function filterForAirtableWaitlist<
  T extends Record<string, unknown>,
>(record: T, allowedKeys: readonly string[]): PhiFilterResult<Record<string, unknown>> {
  const stripped: string[] = [];
  const out: Record<string, unknown> = {};

  for (const key of allowedKeys) {
    const v = record[key];
    if (v === undefined) continue;

    if (BLOCKED_KEY_PATTERNS.test(key)) {
      stripped.push(key);
      continue;
    }
    if (typeof v === "string" && BLOCKED_VALUE_PATTERNS.test(v)) {
      return {
        ok: false,
        reason: "Blocked potential PHI pattern in value",
        strippedKeys: [...stripped, key],
      };
    }
    out[key] = v;
  }

  for (const k of Object.keys(record)) {
    if (!allowedKeys.includes(k)) stripped.push(k);
  }

  return { ok: true, data: out, strippedKeys: stripped };
}
