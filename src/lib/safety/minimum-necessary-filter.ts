import {
  BLOCKED_OUTBOUND_PAYLOAD_KEYS,
  BLOCKED_KEY_REGEX,
} from "./blocked-fields";

export type StripSummaryResult = {
  data: Record<string, unknown>;
  removedKeys: string[];
};

/** Remove nested keys blocked for external sync payloads. */
export function stripBlockedKeysDeep(
  input: Record<string, unknown>,
  extraDenyKeys: string[] = []
): StripSummaryResult {
  const deny = new Set(
    [...BLOCKED_OUTBOUND_PAYLOAD_KEYS].map((k) => k.toLowerCase())
  );
  for (const k of extraDenyKeys) deny.add(k.toLowerCase());

  const removedKeys: string[] = [];

  const walk = (node: unknown): unknown => {
    if (node === null || node === undefined) return node;
    if (Array.isArray(node)) return node.map((x) => walk(x));
    if (typeof node === "object") {
      const obj = node as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        const kl = k.toLowerCase();
        if (
          deny.has(kl) ||
          BLOCKED_KEY_REGEX.test(k)
        ) {
          removedKeys.push(k);
          continue;
        }
        out[k] = walk(v);
      }
      return out;
    }
    return node;
  };

  return { data: walk(input) as Record<string, unknown>, removedKeys };
}

/**
 * Omit long free-text message fields from Airtable/Zap summaries when flagged.
 */
export function excludeFreeTextNotes(
  data: Record<string, unknown>,
  keys: string[] = ["message", "general_notes", "notes", "main_concern", "mainConcern"]
): Record<string, unknown> {
  const out = { ...data };
  for (const k of keys) {
    if (k in out && typeof out[k] === "string" && (out[k] as string).length > 0) {
      out[k] =
        `[omitted:${k}; length=${(out[k] as string).length}]` as unknown as string;
    }
  }
  return out;
}
