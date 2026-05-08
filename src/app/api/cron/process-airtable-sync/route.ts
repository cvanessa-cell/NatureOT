import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";
import { processPendingAirtableSyncJobs } from "@/lib/airtable/process-airtable-sync-job";

function airtableSyncCronAuth(req: Request): boolean {
  const secret = getEnv().CRON_SECRET?.trim();
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function handle(req: Request) {
  if (!airtableSyncCronAuth(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const env = getEnv();
  const limitRaw = env.AIRTABLE_CRON_PROCESS_LIMIT ?? "25";
  const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 25, 1), 200);

  const supabase = createAdminClient();
  const result = await processPendingAirtableSyncJobs({ supabase, limit });

  return NextResponse.json({
    ok: true,
    processed: result.processed,
    succeeded: result.succeeded,
    failed: result.failed,
    dryRun: result.dryRun,
    skippedSyncDisabled: result.skippedSyncDisabled,
  });
}

export const GET = handle;
export const POST = handle;
