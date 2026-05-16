import { NextResponse } from "next/server";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { processPendingAirtableSyncJobs } from "@/lib/airtable/process-airtable-sync-job";

/**
 * Batch processor for Growth OS → Airtable queue rows (privileged/admin only).
 */
export async function POST(req: Request) {
  const { privileged, user } = await getPrivilegedSession();
  if (!privileged || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 75);
  const dryRun = Boolean(body.dryRun);
  const concurrencyRaw = body.concurrency;
  const concurrency =
    concurrencyRaw === undefined || concurrencyRaw === null || concurrencyRaw === ""
      ? undefined
      : Number(concurrencyRaw);

  try {
    const supabase = createAdminClient();
    const result = await processPendingAirtableSyncJobs({
      supabase,
      limit,
      requestDryRun: dryRun,
      ...(Number.isFinite(concurrency) ? { concurrency } : {}),
    });
    return NextResponse.json({
      ok: true,
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed,
      dryRun: result.dryRun,
      skippedSyncDisabled: result.skippedSyncDisabled,
      concurrency: result.concurrency,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
