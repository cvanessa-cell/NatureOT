import { NextResponse } from "next/server";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { pushWaitlistToAirtable } from "@/lib/airtable/sync/waitlist";
import { listAirtableWaitlistPreview } from "@/lib/airtable/sync/waitlist";

/** Privileged staff only — pushes filtered operational data to Airtable. */
export async function POST(req: Request) {
  const { privileged, user } = await getPrivilegedSession();
  if (!privileged || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const target = body.target as string | undefined;
  const dryRun = Boolean(body.dryRun);
  const direction = (body.direction as string) ?? "push";

  const supabase = createAdminClient();

  const { data: job, error: je } = await supabase
    .from("airtable_sync_jobs")
    .insert({
      job_type: target ?? "waitlist",
      direction,
      dry_run: dryRun,
      status: "running",
      started_at: new Date().toISOString(),
      initiated_by: user.id,
      payload: body,
    })
    .select("id")
    .single();

  if (je || !job) {
    return NextResponse.json({ error: je?.message ?? "job error" }, { status: 500 });
  }

  const jobId = job.id as string;

  try {
    if (target === "waitlist" && direction === "push") {
      const result = await pushWaitlistToAirtable({
        dryRun,
        waitlistId: body.waitlistId,
        jobId,
      });
      await supabase
        .from("airtable_sync_jobs")
        .update({
          status: "completed",
          finished_at: new Date().toISOString(),
          payload: { ...body, result },
        })
        .eq("id", jobId);
      return NextResponse.json({ ok: true, jobId, dryRun, ...result });
    }

    if (target === "waitlist" && direction === "pull") {
      const prev = await listAirtableWaitlistPreview();
      await supabase
        .from("airtable_sync_jobs")
        .update({
          status: "completed",
          finished_at: new Date().toISOString(),
          payload: { preview: prev },
        })
        .eq("id", jobId);
      return NextResponse.json({ ok: true, jobId, preview: prev });
    }

    await supabase
      .from("airtable_sync_jobs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error_message: "unsupported_target",
      })
      .eq("id", jobId);
    return NextResponse.json({ error: "Unsupported sync target" }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    await supabase
      .from("airtable_sync_jobs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error_message: msg,
      })
      .eq("id", jobId);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
