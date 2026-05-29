import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  deriveDraftIntroTask,
  deriveOutreachTaskFromOrg,
  type PartnerOutreachOrg,
} from "@/lib/marketing/partner-outreach";

const BodySchema = z.object({
  action: z.enum(["create", "draft_intro"]).optional().default("create"),
  campaignId: z.string().uuid().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { privileged, user } = await getPrivilegedSession();
  if (!privileged || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: organizationId } = await params;
  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.issues }, { status: 400 });
  }

  const db = createAdminClient();
  const { data: orgRow, error: orgError } = await db
    .from("organizations")
    .select("id,name,status,next_follow_up_at")
    .eq("id", organizationId)
    .maybeSingle();

  if (orgError) {
    return NextResponse.json({ error: orgError.message }, { status: 400 });
  }
  if (!orgRow) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  const org = orgRow as PartnerOutreachOrg;
  const draft =
    parsed.data.action === "draft_intro"
      ? deriveDraftIntroTask(org)
      : deriveOutreachTaskFromOrg(org);

  let campaignId = parsed.data.campaignId ?? null;
  if (!campaignId) {
    const { data: campaign } = await db
      .from("campaigns")
      .select("id")
      .ilike("name", "%OTinNATURE%")
      .in("status", ["planned", "active"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    campaignId = campaign?.id ?? null;
  }

  const { data: task, error: insertError } = await db
    .from("outreach_tasks")
    .insert({
      organization_id: organizationId,
      campaign_id: campaignId,
      task_type: draft.taskType,
      channel: draft.channel,
      subject: draft.subject,
      body: draft.body,
      due_date: draft.dueDate,
      status: "not_started",
      approval_required: true,
      notes:
        parsed.data.action === "draft_intro"
          ? "Intro email draft generated from partner record. Review before sending."
          : null,
    })
    .select("id,task_type,channel,subject,status,due_date,created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const orgPatch: Record<string, unknown> = {};
  if (org.status === "not_researched" || org.status === "researched") {
    orgPatch.status = "ready_for_outreach";
  }
  if (!org.next_follow_up_at) {
    orgPatch.next_follow_up_at = `${draft.dueDate}T12:00:00.000Z`;
  }
  if (Object.keys(orgPatch).length > 0) {
    await db.from("organizations").update(orgPatch).eq("id", organizationId);
  }

  return NextResponse.json({
    ok: true,
    taskId: task.id,
    task,
    linkedCampaignId: campaignId,
  });
}
