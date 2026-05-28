import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { scanMarketingCopy } from "@/lib/marketing/compliance-scan";

const BodySchema = z.object({
  title: z.string().min(1),
  assetType: z.string().min(1),
  channel: z.string().optional(),
  audience: z.string().optional(),
  body: z.string().optional(),
  notes: z.string().optional(),
  runComplianceScan: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  const { privileged, user } = await getPrivilegedSession();
  if (!privileged || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.issues }, { status: 400 });
  }

  const v = parsed.data;
  const scan = v.runComplianceScan ? scanMarketingCopy(v.body ?? v.title) : null;
  const complianceStatus = scan?.riskLevel ?? "needs_review";
  const status =
    complianceStatus === "high_risk" || complianceStatus === "do_not_use"
      ? "compliance_review"
      : "draft";

  const db = createAdminClient();
  const { data, error } = await db
    .from("content_assets")
    .insert({
      title: v.title,
      asset_type: v.assetType,
      channel: v.channel || null,
      audience: v.audience || null,
      body: v.body || null,
      notes: v.notes || null,
      status,
      compliance_status: complianceStatus,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (scan && v.body) {
    await db.from("compliance_reviews").insert({
      content_asset_id: data.id,
      review_type: "marketing_copy",
      risk_level: scan.riskLevel,
      flagged_terms: scan.flaggedTerms,
      suggestions: scan.suggestions,
      approved: scan.riskLevel === "approved",
      reviewer_notes: "Auto-scan on create",
    });
  }

  return NextResponse.json({ ok: true, contentAssetId: data.id, complianceStatus });
}
