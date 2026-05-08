import { NextResponse } from "next/server";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { retryFailedAirtableJobs } from "@/lib/airtable/retry-failed-airtable-jobs";

/** Re-queue failed airtable_sync_jobs (staff only). */
export async function POST(req: Request) {
  const { privileged, user } = await getPrivilegedSession();
  if (!privileged || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 75);
  const dryRun = Boolean(body.dryRun);
  const mode = body.mode === "process_now" ? "process_now" : "reset_only";

  try {
    const supabase = createAdminClient();
    const result = await retryFailedAirtableJobs({ supabase, limit, dryRun, mode });
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
