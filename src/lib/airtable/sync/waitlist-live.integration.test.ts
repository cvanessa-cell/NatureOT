import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { pushWaitlistToAirtable } from "./waitlist";

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

const live = process.env.LIVE_AIRTABLE_INTEGRATION === "1";

describe.skipIf(!live)("live waitlist legacy push", () => {
  loadEnvLocal();

  it("pushes a single waitlist row with corrected field names", async () => {
    const result = await pushWaitlistToAirtable({
      dryRun: false,
      waitlistId: "5a202917-75fe-4957-a08d-3b36f34b3d6a",
      jobId: "live-waitlist-mapper-fix",
    });

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));

    expect(result.errors).toHaveLength(0);
    expect(result.pushed).toBeGreaterThan(0);
  });
});
