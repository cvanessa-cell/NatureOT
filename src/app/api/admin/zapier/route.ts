import { NextResponse } from "next/server";
import { getPrivilegedSession, getStaffPortalSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";
import {
  blockedFieldsClassificationDoc,
  buildDryRunOutboundPreview,
  zapiersEnvSnapshot,
} from "@/lib/zapier/admin-zapier-helpers";
import { sendZapierOutbound } from "@/lib/zapier/outbound-webhooks";

export async function GET() {
  const { portalRole, user } = await getStaffPortalSession();
  if (!user || !portalRole) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();

  const [autos, recent, failures] = await Promise.all([
    db.from("zapier_automations").select("*").order("zap_key", { ascending: true }),
    db
      .from("zapier_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(40),
    db
      .from("zapier_events")
      .select("*")
      .eq("result", "failed")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const approvalRequiredCatalog = (
    autos.data ?? []
  ).filter((a: { requires_approval?: boolean }) => a.requires_approval);

  return NextResponse.json({
    ok: true,
    env: zapiersEnvSnapshot(),
    automations: autos.data ?? [],
    recent_events: recent.data ?? [],
    failed_events: failures.data ?? [],
    approval_required_catalog: approvalRequiredCatalog,
    blocked_fields: blockedFieldsClassificationDoc(),
  });
}

/** Owner / Admin: dry-run payloads, Zapier probes, tooling. */
export async function POST(req: Request) {
  const { privileged, user } = await getPrivilegedSession();
  if (!privileged || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action ?? "");

  if (action === "blocked_fields_report") {
    return NextResponse.json({
      ok: true,
      rules: blockedFieldsClassificationDoc(),
    });
  }

  if (action === "dry_run_payload") {
    try {
      const preview = buildDryRunOutboundPreview(body);
      await sendZapierOutbound({
        zapKey: preview.zapKey,
        webhookUrl:
          typeof body.webhookUrl === "string"
            ? (body.webhookUrl as string)
            : undefined,
        payload: preview.payload,
        containsParentChildData: preview.containsParentChildData,
        phiRiskLevel: preview.phiRiskLevel,
        approvalRequired: preview.approvalRequired,
        approvalStatus:
          preview.approvalRequired && body.adminApprovedExternal === true
            ? "approved"
            : preview.approvalRequired
              ? "pending"
              : "not_required",
        logExtras: { dry_run_fixture: preview.fixtureLabel },
        unsubscribed:
          preview.zapKey === "unsubscribe_event"
            ? false
            : Boolean(body.simulateUnsubscribed),
      });
      return NextResponse.json({ ok: true, preview });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "error";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  if (action === "test_ping_inbound_route") {
    const secretOk = !!getEnv().ZAPIER_WEBHOOK_SECRET;
    const exampleUrl =
      `${getEnv().NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/webhooks/zapier/error-log`;

    return NextResponse.json({
      ok: true,
      secretConfigured: secretOk,
      exampleUrl,
      curl_inbound_hint: secretOk
        ? `curl -X POST '${exampleUrl}' -H 'Content-Type: application/json' -H 'x-zapier-secret: ***' -d '{}'`
        : null,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
