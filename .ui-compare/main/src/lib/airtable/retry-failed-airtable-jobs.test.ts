import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { retryFailedAirtableJobs } from "./retry-failed-airtable-jobs";

const processorMock = vi.hoisted(() =>
  vi.fn(async () => ({
    processed: 2,
    succeeded: 2,
    failed: 0,
    skippedSyncDisabled: 0,
    dryRun: true,
    concurrency: 1,
  }))
);

vi.mock("./process-airtable-sync-job", () => ({
  processPendingAirtableSyncJobs: processorMock,
}));

const FAILED_ROWS = [
  {
    id: "failed-1",
    error_message: "422",
    retry_count: 0,
    retry_metadata: {},
  },
];

function mockSbWithFailedRows(rows: typeof FAILED_ROWS) {
  const updatePayloads: unknown[] = [];
  const chain = {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    order() {
      return this;
    },
    gt() {
      return this;
    },
    async limit() {
      return { data: rows, error: null };
    },
    update(payload: unknown) {
      updatePayloads.push(payload);
      return {
        eq: async () => ({ error: null }),
      };
    },
  };

  const supabase = {
    from(table: string) {
      if (table !== "airtable_sync_jobs") throw new Error(`unexpected ${table}`);
      return chain;
    },
    capture: () => ({ updatePayloads }),
  };
  return supabase as unknown as SupabaseClient & {
    capture: () => { updatePayloads: unknown[] };
  };
}

describe("retryFailedAirtableJobs", () => {
  beforeEach(() => {
    processorMock.mockClear();
    vi.clearAllMocks();
  });

  it("reset_only with dry-run performs no mutations", async () => {
    const sb = mockSbWithFailedRows(FAILED_ROWS);
    const res = await retryFailedAirtableJobs({
      supabase: sb,
      limit: 5,
      dryRun: true,
      mode: "reset_only",
    });
    expect(res.reset).toBe(0);
    expect(res.selected).toBe(1);
    expect(sb.capture().updatePayloads).toHaveLength(0);
  });

  it("reset_only resets failed rows to pending and increments counters", async () => {
    const sb = mockSbWithFailedRows(FAILED_ROWS);
    const res = await retryFailedAirtableJobs({
      supabase: sb,
      limit: 5,
      dryRun: false,
      mode: "reset_only",
    });
    expect(res.reset).toBe(1);
    const up = sb.capture().updatePayloads[0] as Record<string, unknown>;
    expect(up.status).toBe("pending");
    expect(up.retry_count).toBe(1);
    expect(up.last_retry_at).toBeTruthy();
    expect(up.retry_metadata).toBeTruthy();
  });

  it("process_now invokes the processor scoped to retries with dry-run", async () => {
    const sb = mockSbWithFailedRows(FAILED_ROWS);
    const res = await retryFailedAirtableJobs({
      supabase: sb,
      limit: 5,
      dryRun: true,
      mode: "process_now",
    });
    expect(res.reset).toBe(1);
    expect(processorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        jobIds: ["failed-1"],
        requestDryRun: true,
      })
    );
    expect(res.processorDryRun).toBe(true);
  });
});
