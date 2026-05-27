import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { getDueSequenceSteps, sendDueSequenceStep } from "@/lib/marketing/sequences";
import { createAdminClient } from "@/lib/supabase/admin";
import { queueZapierOutbound } from "@/lib/zapier/outbound-webhooks";
import { enqueueAirtablePush } from "@/lib/airtable/airtable-sync-queue";

function authOk(req: Request): boolean {
  const env = getEnv();
  if (!env.CRON_SECRET) return process.env.NODE_ENV === "development";
  const h = req.headers.get("authorization");
  if (h === `Bearer ${env.CRON_SECRET}`) return true;
  const q = new URL(req.url).searchParams.get("secret");
  return q === env.CRON_SECRET;
}

export async function GET(req: Request) {
  if (!authOk(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const due = await getDueSequenceSteps(new Date());
  const results: Array<{ enrollmentId: string; status: string }> = [];
  const supabase = createAdminClient();

  for (const enrollment of due) {
    const result = await sendDueSequenceStep(enrollment);
    results.push({ enrollmentId: enrollment.id as string, status: result.status });

    await supabase.from("marketing_audit_logs").insert({
      actor: "cron",
      action: `sequence_step_${result.status}`,
      entity_type: "marketing_sequence_enrollments",
      entity_id: enrollment.id,
      metadata: { lead_id: enrollment.lead_id, sequence_id: enrollment.sequence_id },
    });

    queueZapierOutbound({
      zapKey: "automation_error",
      payload: {
        event: "sequence.message_sent",
        enrollment_id: enrollment.id,
        lead_id: enrollment.lead_id,
        sequence_id: enrollment.sequence_id,
        status: result.status,
        timestamp: new Date().toISOString(),
      },
      containsParentChildData: true,
      phiRiskLevel: "low",
      approvalRequired: false,
      approvalStatus: "not_required",
    });

    await enqueueAirtablePush({
      sourceTable: "marketing_sequence_enrollments",
      sourceRecordId: enrollment.id as string,
      targetAirtableTable: "Marketing Messages",
      safePayloadSummary: {
        enrollment_id: enrollment.id,
        lead_id: enrollment.lead_id,
        sequence_id: enrollment.sequence_id,
        status: result.status,
      },
      dryRun: false,
    });
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}
