import Link from "next/link";
import { requirePrivileged, getAdminDb } from "@/lib/admin-guard";
import { AirtableSyncPanel } from "@/components/airtable-sync-panel";
import { AirtableQueueActions } from "@/components/admin/airtable-queue-actions";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Airtable sync | Nature OT Growth OS",
};

export const dynamic = "force-dynamic";

function payloadPreview(payload: unknown) {
  try {
    let s = JSON.stringify(payload ?? {});
    s = s.replace(/"[^"]*[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}[^"]*"/gi, '"[email-redacted]"');
    return s.length > 260 ? `${s.slice(0, 260)}…` : s;
  } catch {
    return "(unserializable payload)";
  }
}

export default async function AirtableSyncPage({
  searchParams,
}: {
  searchParams: Promise<{ failed?: string }>;
}) {
  await requirePrivileged();
  const sp = await searchParams;
  const failedOnly =
    sp.failed === "1" || sp.failed === "true" || sp.failed === "yes";

  let jobs: Record<string, unknown>[] = [];
  let pending = 0;
  let failed = 0;
  let retriedJobs = 0;
  let succeededToday = 0;
  let lastProcessed: string | null = null;

  try {
    const db = getAdminDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    let jobsQuery = db
      .from("airtable_sync_jobs")
      .select(
        "id, status, dry_run, source_table, source_record_id, target_airtable_table, direction, payload, error_message, created_at, finished_at, started_at, retry_count, last_retry_at"
      )
      .order("created_at", { ascending: false });
    if (failedOnly) {
      jobsQuery = jobsQuery.eq("status", "failed");
    }
    jobsQuery = jobsQuery.limit(failedOnly ? 80 : 60);

    const [
      jobRes,
      pendingRes,
      failedRes,
      retriedRes,
      successRes,
      lastRes,
    ] = await Promise.all([
      jobsQuery,
      db.from("airtable_sync_jobs").select("*", { count: "exact", head: true }).eq("status", "pending"),
      db.from("airtable_sync_jobs").select("*", { count: "exact", head: true }).eq("status", "failed"),
      db
        .from("airtable_sync_jobs")
        .select("*", { count: "exact", head: true })
        .gt("retry_count", 0),
      db
        .from("airtable_sync_jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("finished_at", todayIso),
      db
        .from("airtable_sync_jobs")
        .select("finished_at")
        .eq("status", "completed")
        .order("finished_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    jobs = jobRes.data ?? [];
    pending = pendingRes.count ?? 0;
    failed = failedRes.count ?? 0;
    retriedJobs = retriedRes.count ?? 0;
    succeededToday = successRes.count ?? 0;
    lastProcessed = lastRes.data?.finished_at
      ? String(lastRes.data.finished_at)
      : null;
  } catch {
    jobs = [];
  }

  const envSync = process.env.AIRTABLE_SYNC_ENABLED ?? "(unset)";
  const envDry = process.env.AIRTABLE_DRY_RUN ?? "(unset)";
  const cronSecret = process.env.CRON_SECRET;
  const cronLimit = process.env.AIRTABLE_CRON_PROCESS_LIMIT ?? "(default 25)";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl text-forest">
          Airtable sync
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-bark/80">
          PHI-like marketing fields remain blocked prior to enqueue and again inside the worker. Field mappers
          whitelist internal keys to Airtable column names — unknown keys are dropped.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Pending jobs", value: String(pending) },
          { label: "Failed jobs", value: String(failed) },
          { label: "Retried jobs (retry_count > 0)", value: String(retriedJobs) },
          { label: "Succeeded today", value: String(succeededToday) },
          {
            label: "Worker dry-run gate",
            value: envDry,
            hint: "When true, processor finalizes rows without outbound Airtable calls.",
          },
          {
            label: "Cron readiness",
            value: cronSecret ? "CRON_SECRET set" : "Needs CRON_SECRET",
            hint: `AIRTABLE_CRON_PROCESS_LIMIT=${cronLimit}; schedule in vercel.json (optional).`,
          },
        ].map((m) => (
          <Card key={m.label} className="border-sand bg-white/90 p-4 text-sm shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-bark/60">{m.label}</p>
            <p className="mt-2 text-xl font-semibold tabular-nums text-forest md:text-2xl">{m.value}</p>
            {m.hint && <p className="mt-2 text-[11px] text-bark/70">{m.hint}</p>}
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-sage/60 bg-white/95 p-4 text-sm shadow-sm">
        <p className="text-xs uppercase tracking-wide text-bark/60">Last processed completion</p>
        <p className="mt-2 text-xl font-semibold text-forest">
          {lastProcessed ? new Date(lastProcessed).toLocaleString() : "—"}
        </p>
        <p className="mt-2 text-[11px] text-bark/70">
          AIRTABLE_SYNC_ENABLED server hint:{" "}
          <code className="rounded bg-cream px-1">{envSync}</code>
        </p>
      </Card>

      <AirtableQueueActions
        envDryHint={envDry}
        envSyncEnabledHint={envSync}
        failedFilterActive={failedOnly}
      />

      <div>
        <h2 className="font-[family-name:var(--font-fraunces)] text-lg text-forest">
          Legacy waitlist sync tool
        </h2>
        <p className="mt-1 text-xs text-bark/70">
          Older synchronous waitlist workflows remain available — prefer the queue processor for public lead API
          traffic.
        </p>
        <div className="mt-6">
          <AirtableSyncPanel />
        </div>
      </div>

      <section className="rounded-2xl border border-sand bg-white/90 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-fraunces)] text-lg text-forest">
              Sync queue {failedOnly ? "(failed rows only)" : ""}
            </h2>
            <p className="mt-1 text-xs text-bark/75">
              Payload preview truncates values and masks obvious email literals — raw PHI must never be pasted here.
            </p>
          </div>
          {!failedOnly && (
            <Link
              className="text-xs font-semibold uppercase tracking-wide text-sage underline-offset-4 hover:underline"
              href="/admin/airtable?failed=1"
            >
              View failed only
            </Link>
          )}
          {failedOnly && (
            <Link
              className="text-xs font-semibold uppercase tracking-wide text-sage underline-offset-4 hover:underline"
              href="/admin/airtable"
            >
              Show all statuses
            </Link>
          )}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[1180px] w-full text-left text-xs">
            <thead className="border-b border-sand bg-cream/60 font-medium text-forest">
              <tr>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Retries</th>
                <th className="px-3 py-2">Last retry</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Processed</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Error</th>
                <th className="px-3 py-2">Payload preview</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-bark/70" colSpan={9}>
                    No airtable_sync_jobs recorded for this filter — submit a Growth OS capture to enqueue work.
                  </td>
                </tr>
              )}
              {jobs.map((job) => (
                <tr key={String(job.id)} className="border-t border-sand/70 align-top">
                  <td className="px-3 py-2">{String(job.target_airtable_table ?? "—")}</td>
                  <td className="px-3 py-2 font-mono text-[11px]">{String(job.status ?? "pending")}</td>
                  <td className="px-3 py-2 font-mono text-[11px] tabular-nums">
                    {job.retry_count != null ? String(job.retry_count) : "0"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-[11px] text-bark/80 tabular-nums">
                    {job.last_retry_at
                      ? new Date(job.last_retry_at as string).toLocaleString()
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-[11px] text-bark/80 tabular-nums">
                    {job.created_at ? new Date(job.created_at as string).toLocaleString() : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-[11px] text-bark/80 tabular-nums">
                    {job.finished_at ? new Date(job.finished_at as string).toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px]">
                    <div>{String(job.source_table ?? "—")}</div>
                    <div className="text-[10px] text-bark/60">{String(job.source_record_id ?? "—")}</div>
                  </td>
                  <td className="px-3 py-2 text-[11px] text-red-900/90">
                    {job.error_message ? String(job.error_message) : "—"}
                  </td>
                  <td className="max-w-md px-3 py-2 font-mono text-[10px] text-bark/80 break-all">
                    {payloadPreview(job.payload)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
