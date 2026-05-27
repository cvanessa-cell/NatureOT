import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { processPendingAirtableSyncJobs, resolveAirtableSyncConcurrency } from "./process-airtable-sync-job";

const airtableMock = vi.hoisted(() => vi.fn());

vi.mock("./airtable-client", () => ({
  airtableCreateQueuedRecord: airtableMock,
}));

const LEAD_JOB = {
  id: "job-queue-1",
  payload: {
    lead_id: "lead-q1",
    parent_email: "parent@example.com",
    diagnosis: "should-never-send",
    source_table: "leads",
    source_record_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    target_airtable_table: "Leads",
  },
  target_airtable_table: "Leads",
  status: "pending",
};

function mockSupabase(
  jobs: unknown[]
): SupabaseClient & { updates: unknown[] } {
  const updates: unknown[] = [];

  function queryChain(resolveData: unknown) {
    let inIds: string[] | null = null;
    const chain: {
      select: () => typeof chain;
      eq: () => typeof chain;
      in: (col: string, ids: string[]) => typeof chain;
      order: () => typeof chain;
      limit: () => Promise<{ data: unknown; error: null }>;
    } = {
      select() {
        return chain;
      },
      eq() {
        return chain;
      },
      in(_col: string, ids: string[]) {
        inIds = ids;
        return chain;
      },
      order() {
        return chain;
      },
      limit() {
        const list = resolveData as { id: string }[];
        const data =
          inIds && inIds.length
            ? list.filter((row) => inIds!.includes(row.id))
            : list;
        return Promise.resolve({ data, error: null });
      },
    };
    return chain;
  }

  const supabase = {
    from(table: string) {
      if (table !== "airtable_sync_jobs") {
        throw new Error(`unexpected table ${table}`);
      }
      return {
        select() {
          return queryChain(jobs);
        },
        update(payload: unknown) {
          updates.push(payload);
          return {
            eq: async () => ({ data: null, error: null }),
          };
        },
      };
    },
    updates,
  };
  return supabase as unknown as SupabaseClient & { updates: unknown[] };
}

describe("resolveAirtableSyncConcurrency", () => {
  it("prefers explicit option over env", () => {
    expect(resolveAirtableSyncConcurrency(8, "2", 10)).toBe(8);
  });

  it("uses env when option omitted", () => {
    expect(resolveAirtableSyncConcurrency(undefined, "4", 10)).toBe(4);
  });

  it("defaults to serial when env unset", () => {
    expect(resolveAirtableSyncConcurrency(undefined, undefined, 10)).toBe(1);
  });

  it("caps by batch size", () => {
    expect(resolveAirtableSyncConcurrency(10, undefined, 3)).toBe(3);
  });

  it("treats invalid env as serial", () => {
    expect(resolveAirtableSyncConcurrency(undefined, "nope", 5)).toBe(1);
  });
});

describe("processPendingAirtableSyncJobs", () => {
  const prevEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    airtableMock.mockResolvedValue({ ok: true, recordId: "rec123" });
    process.env = {
      ...prevEnv,
      AIRTABLE_DRY_RUN: "false",
      AIRTABLE_SYNC_ENABLED: "true",
      AIRTABLE_API_KEY: "pat_dummy",
      AIRTABLE_BASE_ID: "base_dummy",
      AIRTABLE_LEADS_TABLE_ID: "tblLeadsDummy",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    };
  });

  afterEach(() => {
    process.env = { ...prevEnv };
  });

  it("finalizes queued jobs without contacting Airtable when AIRTABLE_DRY_RUN=true", async () => {
    process.env.AIRTABLE_DRY_RUN = "true";
    const sb = mockSupabase([LEAD_JOB]);
    const res = await processPendingAirtableSyncJobs({
      supabase: sb,
      limit: 5,
      requestDryRun: false,
    });

    expect(res.dryRun).toBe(true);
    expect(res.succeeded).toBe(1);
    expect(res.concurrency).toBe(1);
    expect(airtableMock).not.toHaveBeenCalled();
    const completion = sb.updates.find(
      (u) =>
        typeof u === "object" &&
        u !== null &&
        (u as { status?: string }).status === "completed"
    );
    expect(completion).toBeTruthy();
    const payload = (completion as { payload?: { _processor?: { mapped_airtable_fields?: unknown } } })
      ?.payload;
    expect(payload?._processor?.mapped_airtable_fields).toEqual(
      expect.objectContaining({
        Email: "parent@example.com",
        "Growth OS Lead ID": "lead-q1",
      })
    );
  });

  it("maps internal keys before invoking Airtable when live sync is enabled", async () => {
    const sb = mockSupabase([LEAD_JOB]);
    const summary = await processPendingAirtableSyncJobs({
      supabase: sb,
      limit: 3,
      requestDryRun: false,
    });

    expect(summary.failed).toBe(0);
    expect(summary.concurrency).toBe(1);
    expect(airtableMock).toHaveBeenCalledTimes(1);
    const fields = airtableMock.mock.calls[0][1] as Record<string, unknown>;
    expect(fields["Growth OS Lead ID"]).toBe("lead-q1");
    expect(fields.Email).toBe("parent@example.com");
    expect((fields as { diagnosis?: string }).diagnosis).toBeUndefined();
  });

  it("processes multiple live jobs with concurrency above one", async () => {
    const jobs = [1, 2, 3].map((n) => ({
      ...LEAD_JOB,
      id: `job-par-${n}`,
      payload: {
        ...LEAD_JOB.payload,
        lead_id: `lead-par-${n}`,
      },
    }));
    const sb = mockSupabase(jobs);
    const summary = await processPendingAirtableSyncJobs({
      supabase: sb,
      limit: 10,
      requestDryRun: false,
      concurrency: 3,
    });

    expect(summary.succeeded).toBe(3);
    expect(summary.concurrency).toBe(3);
    expect(airtableMock).toHaveBeenCalledTimes(3);
  });

  it("marks jobs failed when Airtable returns an error envelope", async () => {
    airtableMock.mockResolvedValueOnce({ ok: false, status: 422, message: "invalid" });
    const sb = mockSupabase([LEAD_JOB]);

    await processPendingAirtableSyncJobs({
      supabase: sb,
      limit: 5,
      requestDryRun: false,
    });

    const failedPayload = sb.updates.find(
      (u) =>
        typeof u === "object" &&
        u !== null &&
        (u as { status?: string }).status === "failed"
    );
    expect(failedPayload).toBeTruthy();
  });

  it("fails mapper targets that are unsupported", async () => {
    const bad = {
      ...LEAD_JOB,
      id: "bad-target",
      target_airtable_table: "Unknown Vendor",
      payload: {
        ...LEAD_JOB.payload,
        target_airtable_table: "Unknown Vendor",
      },
    };
    const sb = mockSupabase([bad]);
    await processPendingAirtableSyncJobs({
      supabase: sb,
      limit: 3,
      requestDryRun: false,
    });
    expect(airtableMock).not.toHaveBeenCalled();
    const failed = sb.updates.find(
      (u) =>
        typeof u === "object" &&
        u !== null &&
        (u as { status?: string }).status === "failed"
    );
    expect((failed as { error_message?: string } | undefined)?.error_message ?? "").toContain(
      "no_airtable_field_mapper_for_target"
    );
  });

  it("marks failed when whitelist mapping yields zero Airtable fields", async () => {
    const empty = {
      ...LEAD_JOB,
      id: "empty-map",
      payload: {
        source_table: "leads",
        source_record_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        target_airtable_table: "Leads",
      },
    };
    const sb = mockSupabase([empty]);
    await processPendingAirtableSyncJobs({
      supabase: sb,
      limit: 2,
      requestDryRun: false,
    });
    expect(airtableMock).not.toHaveBeenCalled();
    expect(
      sb.updates.some(
        (u) =>
          typeof u === "object" &&
          u !== null &&
          (u as { error_message?: string }).error_message === "mapped_fields_empty"
      )
    ).toBe(true);
  });

  it("scopes processing to supplied job ids", async () => {
    const j2 = {
      ...LEAD_JOB,
      id: "job-2",
      payload: {
        ...LEAD_JOB.payload,
        lead_id: "lead-other",
      },
    };
    const sb = mockSupabase([LEAD_JOB, j2]);
    await processPendingAirtableSyncJobs({
      supabase: sb,
      limit: 10,
      requestDryRun: false,
      jobIds: [(LEAD_JOB as { id: string }).id],
    });
    expect(airtableMock).toHaveBeenCalledTimes(1);
    const fields = airtableMock.mock.calls[0][1] as Record<string, unknown>;
    expect(fields["Growth OS Lead ID"]).toBe("lead-q1");
  });

  it("processes multiple live jobs with concurrency above one", async () => {
    const jobs = [1, 2, 3].map((n) => ({
      ...LEAD_JOB,
      id: `job-par-${n}`,
      payload: {
        ...LEAD_JOB.payload,
        lead_id: `lead-par-${n}`,
      },
    }));
    const sb = mockSupabase(jobs);
    const summary = await processPendingAirtableSyncJobs({
      supabase: sb,
      limit: 10,
      requestDryRun: false,
      concurrency: 3,
    });

    expect(summary.succeeded).toBe(3);
    expect(summary.concurrency).toBe(3);
    expect(airtableMock).toHaveBeenCalledTimes(3);
  });
});
