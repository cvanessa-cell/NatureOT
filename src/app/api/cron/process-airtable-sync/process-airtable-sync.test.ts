import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

const proc = vi.hoisted(() =>
  vi.fn(async () => ({
    processed: 1,
    succeeded: 1,
    failed: 0,
    skippedSyncDisabled: 0,
    dryRun: false,
  }))
);

vi.mock("@/lib/airtable/process-airtable-sync-job", () => ({
  processPendingAirtableSyncJobs: proc,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({})),
}));

vi.mock("@/lib/env", () => ({
  getEnv: vi.fn(() => ({
    CRON_SECRET: "cron-test-secret",
    AIRTABLE_CRON_PROCESS_LIMIT: "7",
    AIRTABLE_DRY_RUN: "false",
    AIRTABLE_SYNC_ENABLED: "true",
  })),
}));

describe("/api/cron/process-airtable-sync", () => {
  const prev = { ...process.env };

  beforeEach(() => {
    proc.mockClear();
    process.env = { ...prev, CRON_SECRET: "cron-test-secret" };
  });

  afterEach(() => {
    process.env = { ...prev };
  });

  it("rejects missing Authorization", async () => {
    const res = await GET(new Request("http://localhost/api/cron/process-airtable-sync"));
    expect(res.status).toBe(401);
    expect(proc).not.toHaveBeenCalled();
  });

  it("rejects invalid bearer token", async () => {
    const res = await GET(
      new Request("http://localhost/api/cron/process-airtable-sync", {
        headers: { authorization: "Bearer wrong" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("processes pending jobs with a valid secret", async () => {
    const res = await GET(
      new Request("http://localhost/api/cron/process-airtable-sync", {
        headers: { authorization: "Bearer cron-test-secret" },
      })
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.processed).toBe(1);
    expect(proc).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 7,
      })
    );
  });

  it("supports POST like GET", async () => {
    const res = await POST(
      new Request("http://localhost/api/cron/process-airtable-sync", {
        method: "POST",
        headers: { authorization: "Bearer cron-test-secret" },
      })
    );
    expect(res.status).toBe(200);
  });
});
