import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffPortalSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  campaignId: z.string().uuid(),
  destinationUrl: z.string().url(),
  label: z.string().min(1),
  source: z.string().optional(),
  medium: z.string().optional(),
  content: z.string().optional(),
  term: z.string().optional(),
});

export async function POST(req: Request) {
  const { user, portalRole } = await getStaffPortalSession();
  if (!user || !portalRole) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const body = parsed.data;

  const db = createAdminClient();
  const { data: campaign } = await db.from("marketing_campaigns").select("slug").eq("id", body.campaignId).single();
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const url = new URL(body.destinationUrl);
  if (body.source) url.searchParams.set("utm_source", body.source);
  if (body.medium) url.searchParams.set("utm_medium", body.medium);
  url.searchParams.set("utm_campaign", campaign.slug);
  if (body.content) url.searchParams.set("utm_content", body.content);
  if (body.term) url.searchParams.set("utm_term", body.term);
  const generatedUrl = url.toString();

  await db.from("campaign_links").insert({
    campaign_id: body.campaignId,
    label: body.label,
    destination_url: body.destinationUrl,
    utm_source: body.source ?? null,
    utm_medium: body.medium ?? null,
    utm_campaign: campaign.slug,
    utm_content: body.content ?? null,
    utm_term: body.term ?? null,
    generated_url: generatedUrl,
  });

  return NextResponse.json({ ok: true, generatedUrl });
}
