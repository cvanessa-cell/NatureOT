/**
 * Minimum-necessary + blocked-field stripping for payloads leaving the Growth OS boundary.
 * Mirrors Airtable PHI posture; Zapier receives only operational fields approved for bridges.
 */

const BLOCKED_KEY_SUBSTRINGS =
  /(^|_)((child_)?full_?dob|date_of_birth|birthdate|mrn|ssn|insurance|policy|subscriber|diagnosis|icd|dsm|clinical|progress_note|therapy_eval|treatment_plan|medical_history|medications|school_record|evaluation|developmental_history|phi)/i;

const BLOCKED_EXACT_KEYS = new Set(
  [
    "mainConcern",
    "main_concern",
    "quizAnswers",
    "quiz_answers",
    "scores",
    "sessionId",
    "notes_internal",
    "general_notes", // operational notes kept out of Zapier-by-default bridges
    "comment", // survey free text → keep separate explicit mapper if needed
  ].map((k) => k.toLowerCase())
);

const SENSITIVE_VALUE_PATTERNS =
  /\b(icd-?\d|dsm-?\d|policy\s*#|subscriber\s*id|social\s*security)\b/i;

/** Human-readable rules for `/admin/zapier` tooling and Lucidchart handoffs. */
export const BLOCKED_FIELDS_DOC = [
  {
    id: "keys",
    title: "Key-based deny patterns",
    description:
      "Any field matching blocked substrings (diagnosis, DOB variants, evaluation, medications, PHI, subscriber id, ICD/DSM, etc.) is removed before payloads leave the Growth OS Zapier boundary.",
  },
  {
    id: "exact",
    title: "Exact operational withholds",
    description:
      "Quiz answers, quiz scores, long-form intake notes/comments, clinical concern fields, internal notes strings, marketing session ids, and similar are stripped by default so Catch Hooks only receive minimum-necessary operational context.",
  },
  {
    id: "values",
    title: "Value-level redaction",
    description:
      "If a string value appears to reference ICD/DSM codes, policy numbers, or SSN phrasing, the value is replaced with “[redacted]” and the key is noted in logs.",
  },
] as const;

export type StripPayloadResult = {
  data: Record<string, unknown>;
  strippedKeys: string[];
  phiRiskSuggestion: "none" | "low" | "medium" | "high";
};

function includesParentChild(keys: Iterable<string>): boolean {
  const k = [...keys].join(" ").toLowerCase();
  return (
    k.includes("parent") ||
    k.includes("child") ||
    k.includes("waitlist") ||
    k.includes("lead")
  );
}

/**
 * Detect disallowed Zapier payload keys before send.
 */
export function isBlockedZapierKey(key: string): boolean {
  const lower = key.toLowerCase();
  if (BLOCKED_EXACT_KEYS.has(lower)) return true;
  return BLOCKED_KEY_SUBSTRINGS.test(key);
}

/**
 * Depth-first clone that drops blocked keys and redacts risky string values → "[redacted]".
 */
export function stripUnsafeZapierPayload(
  input: Record<string, unknown>,
  opts?: {
    /** Extra keys beyond the denylist */
    denyKeys?: string[];
  }
): StripPayloadResult {
  const strippedKeys: string[] = [];
  const deny = new Set((opts?.denyKeys ?? []).map((k) => k.toLowerCase()));

  const walk = (node: unknown): unknown => {
    if (node === null || node === undefined) return node;
    if (Array.isArray(node)) return node.map((x) => walk(x));
    if (typeof node === "object" && !(node instanceof Date)) {
      const obj = node as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        const kl = k.toLowerCase();
        if (deny.has(kl) || isBlockedZapierKey(k)) {
          strippedKeys.push(k);
          continue;
        }
        if (typeof v === "string" && SENSITIVE_VALUE_PATTERNS.test(v)) {
          strippedKeys.push(`${k}__value_pattern`);
          out[k] = "[redacted]";
          continue;
        }
        out[k] = walk(v);
      }
      return out;
    }
    if (typeof node === "string" && SENSITIVE_VALUE_PATTERNS.test(node)) {
      return "[redacted]";
    }
    return node;
  };

  const data = walk(input) as Record<string, unknown>;
  let phiRiskSuggestion: StripPayloadResult["phiRiskSuggestion"] = "none";
  if (strippedKeys.length) phiRiskSuggestion = "low";
  if (includesParentChild(Object.keys(data))) phiRiskSuggestion = "low";

  return { data, strippedKeys, phiRiskSuggestion };
}

/**
 * Build a short JSON-safe summary for Supabase row `payload_summary` (no long PII).
 */
export function summarizePayloadForLog(
  data: Record<string, unknown>,
  maxLen = 1800,
  extras?: Record<string, unknown>
): Record<string, unknown> {
  const flat: Record<string, unknown> = {
    keys: Object.keys(data),
    strippedTopLevel: [],
    ...(extras ?? {}),
  };

  try {
    const json = JSON.stringify(data);
    if (json.length <= maxLen) {
      flat.preview = JSON.parse(json) as Record<string, unknown>;
      return flat;
    }
    flat.preview_truncated =
      json.slice(0, maxLen) +
      `… (${json.length - maxLen} more chars truncated for log)`;
  } catch {
    flat.preview = "[unserializable]";
  }

  return flat;
}
