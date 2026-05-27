import { getEnv } from "@/lib/env";

const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 400;

/** Typed Airtable REST helper — credentials ONLY from environment variables. */
export async function airtableRequest<T>(options: {
  method: "GET" | "PATCH" | "POST";
  path: string;
  /** Optional JSON body for PATCH/POST */
  body?: unknown;
}): Promise<{ ok: true; data: T } | { ok: false; status: number; body: string }> {
  const env = getEnv();
  const token = env.AIRTABLE_API_KEY;
  const baseId = env.AIRTABLE_BASE_ID;
  if (!token || !baseId) {
    return {
      ok: false,
      status: 503,
      body: "AIRTABLE_API_KEY / AIRTABLE_BASE_ID not configured",
    };
  }

  const url = `https://api.airtable.com/v0/${baseId}${options.path}`;
  let lastText = "";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(url, {
      method: options.method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    lastText = await res.text();
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) =>
        setTimeout(r, BASE_DELAY_MS * Math.pow(2, attempt - 1))
      );
      continue;
    }
    if (!res.ok) {
      return { ok: false, status: res.status, body: lastText };
    }
    try {
      return { ok: true, data: JSON.parse(lastText) as T };
    } catch {
      return { ok: false, status: res.status, body: lastText };
    }
  }
  return { ok: false, status: 503, body: lastText || "retry_exhausted" };
}
