import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createAdminClient } from "@/lib/supabase/admin";
import { retryFailedAirtableJobs } from "@/lib/airtable/retry-failed-airtable-jobs";

function loadEnvLocal() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvLocal();

const live = process.env.LIVE_AIRTABLE_INTEGRATION === "1";

describe.skipIf(!live)("live airtable failed-job retry", () => {
  it("resets and processes failed queue rows against Airtable", async () => {
    const supabase = createAdminClient();
    const result = await retryFailedAirtableJobs({
      supabase,
      limit: 10,
      dryRun: false,
      mode: "process_now",
    });

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));

    expect(result.ok).toBe(true);
    if (result.selected > 0) {
      expect(result.succeeded).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
    }
  });
});
