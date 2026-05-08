/* eslint-disable @typescript-eslint/no-unused-vars -- Supabase-like chain mocks omit unused arity */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SendZapierOutboundInput } from "@/lib/zapier/outbound-webhooks";
import { enqueueAirtablePush } from "@/lib/airtable/airtable-sync-queue";
import { POST as postWorkshop } from "@/app/api/workshop-registration/route";
import { POST as postReferral } from "@/app/api/referral-inquiry/route";
import { POST as postParentGuide } from "@/app/api/parent-guide-lead/route";

const store = vi.hoisted(() => {
  const FIXED_MARKETING_SEQ_ID = "00000000-0000-4000-8000-099999999999";
  type LeadStub = {
    id: string;
    parent_phone: string | null;
    lead_source?: string | null;
    form_type?: string | null;
    main_concern?: string | null;
    city_or_zip?: string | null;
    unsubscribed_at?: string | null;
  };

  const leadsByEmail = new Map<string, { id: string; parent_phone: string | null }>();
  const leadsById = new Map<string, LeadStub>();
  let seq = 0;
  const nextUuid = () => {
    seq += 1;
    return `00000000-0000-4000-8000-${String(seq).padStart(12, "0")}`;
  };

  const log: Array<{ table: string; payload: unknown }> = [];

  type FilterState = {
    eqs: [string, unknown][];
    ins: [string, unknown[]][];
    opts?: { count?: string; head?: boolean };
    columns?: string;
  };

  function getEq(eqs: FilterState["eqs"], col: string) {
    return eqs.find(([c]) => c === col)?.[1];
  }

  function maybeSingleResult(table: string, filters: FilterState): unknown | null {
    if (table === "marketing_sequences") {
      const trig = getEq(filters.eqs, "trigger_type") as string | undefined;
      const stat = getEq(filters.eqs, "status");
      if (trig && stat === "active") {
        return { id: FIXED_MARKETING_SEQ_ID, status: "active" };
      }
      return null;
    }
    if (table === "marketing_sequence_enrollments") {
      const statuses = filters.ins.find(([c]) => c === "status")?.[1] as unknown[] | undefined;
      const hasActiveDupQuery =
        getEq(filters.eqs, "lead_id") !== undefined &&
        getEq(filters.eqs, "sequence_id") !== undefined &&
        Array.isArray(statuses) &&
        statuses.some((s) => s === "active" || s === "paused");
      if (hasActiveDupQuery) return null;
      return null;
    }
    if (table === "leads") {
      const email = getEq(filters.eqs, "parent_email");
      const id = getEq(filters.eqs, "id");
      if (typeof email === "string") {
        const row = leadsByEmail.get(String(email).toLowerCase());
        if (row) {
          return {
            id: row.id,
            parent_phone: row.parent_phone,
          };
        }
      }
      if (typeof id === "string" && leadsById.has(id)) {
        return leadsById.get(id) ?? null;
      }
      return null;
    }
    if (table === "lead_lifecycle_events") {
      return null;
    }
    return null;
  }

  function resolveSelect(table: string, filters: FilterState): { data: unknown; count: number | null } {
    if (filters.opts?.head && filters.opts?.count === "exact") {
      return { data: null, count: 0 };
    }

    if (table === "lead_lifecycle_events" && getEq(filters.eqs, "lead_id")) {
      return { data: [], count: null };
    }

    if (table === "lead_segments" && filters.eqs.length === 0) {
      return { data: [], count: null };
    }

    const row = maybeSingleResult(table, filters);
    if (row != null) {
      return { data: Array.isArray(row) ? row : [row], count: null };
    }
    return { data: [], count: null };
  }

  function createSelectChain(table: string): {
    filters: FilterState;
    eq: (c: string, v: unknown) => ReturnType<typeof createSelectChain>;
    in: (c: string, v: unknown[]) => ReturnType<typeof createSelectChain>;
    not: (c: string, op: string, v: unknown) => ReturnType<typeof createSelectChain>;
    order: (_col?: string, _opts?: { ascending?: boolean }) => ReturnType<typeof createSelectChain>;
    limit: (_n?: number) => ReturnType<typeof createSelectChain>;
    gte: (c: string, v: unknown) => ReturnType<typeof createSelectChain>;
    lte: (c: string, v: unknown) => ReturnType<typeof createSelectChain>;
    maybeSingle: () => Promise<{ data: unknown; error: null }>;
    single: () => Promise<{ data: unknown; error: null }>;
    then: (
      onFulfilled: (value: { data: unknown; error: null; count?: number | null }) => unknown
    ) => Promise<unknown>;
  } {
    const filters: FilterState = { eqs: [], ins: [] };
    const chain = {
      filters,
      select(columns?: string, opts?: { count?: string; head?: boolean }) {
        filters.columns = columns;
        filters.opts = opts;
        return chain;
      },
      eq(c: string, v: unknown) {
        filters.eqs.push([c, v]);
        return chain;
      },
      in(c: string, v: unknown[]) {
        filters.ins.push([c, v]);
        return chain;
      },
      not(_c: string, _op: string, _v: unknown) {
        return chain;
      },
      order(_col?: string, _opts?: { ascending?: boolean }) {
        return chain;
      },
      limit(_n?: number) {
        return chain;
      },
      gte(_c: string, _v: unknown) {
        return chain;
      },
      lte(_c: string, _v: unknown) {
        return chain;
      },
      async maybeSingle() {
        const data = maybeSingleResult(table, filters);
        return { data, error: null };
      },
      async single() {
        const data = maybeSingleResult(table, filters);
        return { data, error: null };
      },
      then(onFulfilled: (value: { data: unknown; error: null; count?: number | null }) => unknown) {
        const { data, count } = resolveSelect(table, filters);
        return Promise.resolve({ data, error: null, count }).then(onFulfilled);
      },
    };
    return chain;
  }

  function insertBuilder(table: string, payload: unknown) {
    log.push({ table, payload });
    return {
      select(_cols?: string) {
        return {
          async single() {
            const id = nextUuid();
            if (table === "leads") {
              const p = payload as {
                parent_email?: string;
                parent_phone?: string | null;
                lead_source?: string | null;
                form_type?: string | null;
                main_concern?: string | null;
                city_or_zip?: string | null;
              };
              const email = String(p.parent_email ?? "").toLowerCase();
              if (email) {
                leadsByEmail.set(email, {
                  id,
                  parent_phone: p.parent_phone ?? null,
                });
              }
              const stub: LeadStub = {
                id,
                parent_phone: p.parent_phone ?? null,
                lead_source: p.lead_source ?? null,
                form_type: p.form_type ?? null,
                main_concern: p.main_concern ?? null,
                city_or_zip: p.city_or_zip ?? null,
                unsubscribed_at: null,
              };
              leadsById.set(id, stub);
            }
            return { data: { id }, error: null };
          },
        };
      },
      then(onFulfilled: (value: unknown) => unknown) {
        return Promise.resolve({ data: null, error: null }).then(onFulfilled);
      },
    };
  }

  function createUpdateChain(table: string, payload: unknown) {
    const self = {
      eq(_c: string, _v: unknown) {
        return self;
      },
      in(_c: string, _v: unknown[]) {
        return self;
      },
      then(onFulfilled: (value: unknown) => unknown) {
        log.push({ table: `${table}:update`, payload });
        return Promise.resolve({ error: null }).then(onFulfilled);
      },
    };
    return self;
  }

  function from(table: string) {
    return {
      select(columns?: string, opts?: { count?: string; head?: boolean }) {
        const c = createSelectChain(table);
        return c.select(columns, opts);
      },
      insert(payload: unknown) {
        return insertBuilder(table, payload);
      },
      update(patch: unknown) {
        return createUpdateChain(table, patch);
      },
      upsert(payload: unknown, _opts?: unknown) {
        log.push({ table: `${table}:upsert`, payload });
        const self = {
          then(onFulfilled: (value: unknown) => unknown) {
            return Promise.resolve({ data: null, error: null }).then(onFulfilled);
          },
        };
        return self;
      },
    };
  }

  return {
    log,
    reset() {
      log.length = 0;
      leadsByEmail.clear();
      leadsById.clear();
      seq = 0;
    },
    createClient() {
      return {
        from,
      };
    },
  };
});

const queuedZaps: SendZapierOutboundInput[] = [];

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => store.createClient(),
}));

vi.mock("@/lib/email/send-transactional-email", () => ({
  sendOperationalEmail: vi.fn(async () => ({
    resendEmailId: null,
    dryRun: true,
    skippedReason: "email_not_configured",
  })),
}));

vi.mock("@/lib/zapier/outbound-webhooks", () => ({
  queueZapierOutbound: vi.fn((input: SendZapierOutboundInput) => {
    queuedZaps.push(input);
  }),
}));

vi.mock("@/lib/env", () => ({
  getEnv: () => ({
    SUPABASE_SERVICE_ROLE_KEY: "test-service-role",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    RESEND_API_KEY: undefined,
    EMAIL_FROM: undefined,
    EMAIL_DRY_RUN: undefined,
    ZAPIER_ENABLED: "true",
    ZAPIER_DRY_RUN: "true",
  }),
  getSupabaseUrl: () => "http://localhost:54321",
  appBaseUrl: () => "http://localhost:3000",
  isAgentAirtableEnabled: () => false,
}));

function jsonReq(body: unknown) {
  return new Request("http://localhost/api/workshop-registration", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("public lead APIs", () => {
  beforeEach(() => {
    store.reset();
    queuedZaps.length = 0;
    vi.clearAllMocks();
  });

  it("workshop-registration creates lead + registration + ops rows + zap audit", async () => {
    const res = await postWorkshop(
      jsonReq({
        parentName: "Jamie Rivera",
        parentEmail: "jamie@example.com",
        workshopId: "spring-nature-play",
        city: "Austin",
        consentPrivacy: true,
        consentReminders: false,
      })
    );

    expect(res.status).toBe(200);
    const j = (await res.json()) as { ok: boolean; registrationId: string; leadId: string };
    expect(j.ok).toBe(true);
    expect(j.registrationId).toBeTruthy();
    expect(j.leadId).toBeTruthy();

    const tables = store.log.map((x) => x.table);
    expect(tables).toContain("leads");
    expect(tables).toContain("workshop_registrations");
    expect(tables).toContain("consent_logs");
    expect(tables).toContain("email_events");
    expect(tables).toContain("airtable_sync_jobs");
    expect(tables).toContain("lead_attribution_events");
    expect(tables).toContain("lead_lifecycle_events");
    expect(tables).toContain("marketing_sequence_enrollments");

    const zap = queuedZaps.find((z) => z.auditEventType === "workshop_registration_created");
    expect(zap?.zapKey).toBe("workshop_registration");
    expect(JSON.stringify(zap?.payload)).not.toMatch(/diagnosis/i);
  });

  it("referral-inquiry creates inquiry + email event + airtable job + zap audit", async () => {
    const res = await postReferral(
      new Request("http://localhost/api/referral-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName: "Cedar Grove Cooperative",
          contactName: "Alex Kim",
          email: "alex@example.org",
          partnerType: "Homeschool network",
          city: "Round Rock",
          message: "We have a child with diagnosis ADHD who might benefit — message for routing only.",
          consentPrivacy: true,
        }),
      })
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; referralInquiryId: string };
    expect(body.ok).toBe(true);

    const tables = store.log.map((x) => x.table);
    expect(tables).toContain("referral_inquiries");
    expect(tables).toContain("consent_logs");
    expect(tables).toContain("email_events");
    expect(tables).toContain("airtable_sync_jobs");
    expect(tables).toContain("lead_attribution_events");
    expect(tables).toContain("lead_lifecycle_events");
    expect(tables).toContain("marketing_sequence_enrollments");

    const zap = queuedZaps.find((z) => z.auditEventType === "referral_inquiry_created");
    expect(zap?.zapKey).toBe("referral_inquiry");
    expect(zap?.payload.message).toBeUndefined();
    expect(JSON.stringify(zap?.payload)).not.toMatch(/diagnosis/i);
  });

  it("parent-guide-lead creates lead + guide row + consent + integrations", async () => {
    const res = await postParentGuide(
      new Request("http://localhost/api/parent-guide-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: "Taylor Quinn",
          parentEmail: "taylor@example.com",
          city: "Dallas",
          consentPrivacy: true,
          consentGuide: true,
        }),
      })
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; leadId: string; guideLeadId: string };
    expect(body.ok).toBe(true);

    const tables = store.log.map((x) => x.table);
    expect(tables).toContain("leads");
    expect(tables).toContain("parent_guide_leads");
    expect(tables).toContain("consent_logs");
    expect(tables).toContain("email_events");
    expect(tables).toContain("airtable_sync_jobs");
    expect(tables).toContain("lead_attribution_events");
    expect(tables).toContain("lead_lifecycle_events");
    expect(tables).toContain("marketing_sequence_enrollments");

    const zap = queuedZaps.find((z) => z.auditEventType === "parent_guide_lead_created");
    expect(zap?.zapKey).toBe("parent_guide_lead");
  });

  it("duplicate workshop emails update the same lead instead of inserting twice", async () => {
    const payload = {
      parentName: "Jamie Rivera",
      parentEmail: "dup@example.com",
      workshopId: "spring-nature-play",
      consentPrivacy: true,
    };
    const first = await postWorkshop(jsonReq(payload));
    const second = await postWorkshop(jsonReq(payload));
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    const leadInserts = store.log.filter((x) => x.table === "leads").length;
    const leadUpdates = store.log.filter((x) => x.table === "leads:update").length;
    expect(leadInserts).toBe(1);
    expect(leadUpdates).toBe(1);

    const regs = store.log.filter((x) => x.table === "workshop_registrations").length;
    expect(regs).toBe(2);
  });

  it("persist optional eventStartsAt onto workshop registration for nurture anchors", async () => {
    const eventIso = new Date(Date.UTC(2026, 4, 20, 15, 0, 0)).toISOString();
    const res = await postWorkshop(
      jsonReq({
        parentName: "Jordan Lee",
        parentEmail: "jordan@example.com",
        workshopId: "motor-confidence",
        consentPrivacy: true,
        consentReminders: true,
        eventStartsAt: eventIso,
      })
    );
    expect(res.status).toBe(200);
    const row = store.log.find((x) => x.table === "workshop_registrations");
    expect(row).toBeTruthy();
    expect((row!.payload as { event_starts_at?: string }).event_starts_at).toBe(eventIso);
  });

  it("returns 400 for invalid workshop payload (email)", async () => {
    const res = await postWorkshop(
      jsonReq({
        parentName: "Test",
        parentEmail: "not-an-email",
        workshopId: "spring-nature-play",
        consentPrivacy: true,
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when referral email missing", async () => {
    const res = await postReferral(
      new Request("http://localhost/api/referral-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName: "Org",
          contactName: "Name",
          partnerType: "School",
          city: "Austin",
          consentPrivacy: true,
        }),
      })
    );
    expect(res.status).toBe(400);
  });
});

describe("airtable sync queue summaries", () => {
  beforeEach(() => {
    store.reset();
  });

  it("strips blocked PHI-like keys before persisting enqueue payload", async () => {
    await enqueueAirtablePush({
      sourceTable: "referral_inquiries",
      sourceRecordId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      targetAirtableTable: "Referral Inquiries",
      safePayloadSummary: {
        inquiry_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        partner_email: "p@example.com",
        diagnosis: "example",
        nested: { medicalHistory: "secret" },
      },
      dryRun: false,
    });

    const row = store.log.find((x) => x.table === "airtable_sync_jobs");
    expect(row).toBeTruthy();
    const payload = (row!.payload as { payload: Record<string, unknown> }).payload;
    expect(payload.diagnosis).toBeUndefined();
    expect((payload.nested as Record<string, unknown>)?.medicalHistory).toBeUndefined();
    const stripped = payload._stripped_blocked_keys as string[];
    expect(stripped.join(",")).toMatch(/diagnosis/i);
    expect(stripped.join(",")).toMatch(/medicalHistory/i);
    const { _stripped_blocked_keys, ...syncFields } = payload;
    expect(_stripped_blocked_keys).toBeDefined();
    expect(JSON.stringify(syncFields)).not.toMatch(/secret/i);
  });
});
