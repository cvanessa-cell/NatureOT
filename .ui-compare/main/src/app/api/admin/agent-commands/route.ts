import { NextResponse } from "next/server";
import { getStaffPortalSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { runPreviewCommand } from "@/lib/agent-airtable/preview-commands";
import { writeAuditLog } from "@/lib/audit";
import { isAgentAirtableEnabled } from "@/lib/env";

/** Preview a safe operational command (no external writes). */
export async function POST(req: Request) {
  const { user, portalRole } = await getStaffPortalSession();
  if (!user || !portalRole) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const commandKey = body.commandKey as string | undefined;
  if (!commandKey) {
    return NextResponse.json({ error: "commandKey required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { preview, proposedWrites } = await runPreviewCommand(commandKey, body.payload ?? {});

  const { data: row, error } = await supabase
    .from("agent_airtable_actions")
    .insert({
      command_key: commandKey,
      preview_payload: preview as never,
      proposed_writes: proposedWrites as never,
      status: "preview",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !row) {
    return NextResponse.json({ error: error?.message ?? "insert failed" }, { status: 500 });
  }

  await writeAuditLog({
    actor: user.email ?? user.id,
    action: "agent_airtable_preview",
    resourceType: "agent_airtable_actions",
    resourceId: row.id as string,
    details: { commandKey },
  });

  return NextResponse.json({
    ok: true,
    actionId: row.id,
    preview,
    proposedWrites,
    agentAirtableEnabled: isAgentAirtableEnabled(),
    /**
     * MCP integration point: when Agent_Airtable MCP is available in Cursor,
     * mirror this preview using user-airtable tools — same commandKey + payload.
     * Never send PHI; operational fields only.
     */
  });
}

/** Mark preview executed (no auto-publish — writes to Airtable only after explicit extension). */
export async function PATCH(req: Request) {
  const { user, portalRole } = await getStaffPortalSession();
  if (!user || !portalRole) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const actionId = body.actionId as string | undefined;
  const approve = Boolean(body.approve);
  if (!actionId) {
    return NextResponse.json({ error: "actionId required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!approve) {
    await supabase
      .from("agent_airtable_actions")
      .update({ status: "rejected", approved_by: user.id, approved_at: new Date().toISOString() })
      .eq("id", actionId);
    await writeAuditLog({
      actor: user.email ?? user.id,
      action: "agent_airtable_rejected",
      resourceType: "agent_airtable_actions",
      resourceId: actionId,
    });
    return NextResponse.json({ ok: true, status: "rejected" });
  }

  await supabase
    .from("agent_airtable_actions")
    .update({
      status: "executed",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      executed_at: new Date().toISOString(),
      result_payload: { note: "Acknowledged — no external publish from Growth OS MVP" },
    })
    .eq("id", actionId);

  await writeAuditLog({
    actor: user.email ?? user.id,
    action: "agent_airtable_approved_executed",
    resourceType: "agent_airtable_actions",
    resourceId: actionId,
  });

  /**
   * If proposed_writes contained Airtable patch bodies, execute here behind PHI filter.
   * Agent_Airtable MCP: map approved payloads to Airtable API or MCP create/update calls.
   */

  return NextResponse.json({ ok: true, status: "executed" });
}
