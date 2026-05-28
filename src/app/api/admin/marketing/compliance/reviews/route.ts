import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { scanMarketingCopy, type ComplianceRiskLevel } from "@/lib/marketing/compliance-scan";

const BodySchema = z.object({
  text: z.string().min(1),
  contentAssetId: z.string().uuid().optional(),
  approved: z.boolean().optional(),
  reviewerNotes: z.string().optional(),
  riskLevel: z.enum(["approved", "needs_review", "high_risk", "do_not_use"]).optional(),
  flaggedTerms: z.array(z.string()).optional(),
  suggestions: z.array(z.string()).optional(),
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

  const scan = scanMarketingCopy(parsed.data.text);
  const riskLevel: ComplianceRiskLevel = parsed.data.riskLevel ?? scan.riskLevel;
  const approved = parsed.data.approved ?? riskLevel === "approved";

  const db = createAdminClient();
  const { data, error } = await db
    .from("compliance_reviews")
    .insert({
      content_asset_id: parsed.data.contentAssetId ?? null,
      review_type: "marketing_copy",
      risk_level: riskLevel,
      flagged_terms: parsed.data.flaggedTerms ?? scan.flaggedTerms,
      suggestions: parsed.data.suggestions ?? scan.suggestions,
      approved,
      reviewer_notes: parsed.data.reviewerNotes ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (parsed.data.contentAssetId) {
    await db
      .from("content_assets")
      .update({
        compliance_status: riskLevel,
        status: approved ? "approved" : "compliance_review",
      })
      .eq("id", parsed.data.contentAssetId);
  }

  return NextResponse.json({ ok: true, reviewId: data.id, riskLevel, approved });
}
