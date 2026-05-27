import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const BodySchema = z.object({
  templateKey: z.string().min(1),
  name: z.string().min(1),
  cities: z.array(z.string().min(1)).optional().default([]),
  startDate: z.string().optional(),
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

  const db = createAdminClient();
  const { templateKey, name, cities, startDate } = parsed.data;

  const tpl = await db
    .from("campaign_templates")
    .select("id,key,name,default_config")
    .eq("key", templateKey)
    .maybeSingle();

  if (!tpl.data) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const cfg = (tpl.data.default_config ?? {}) as Record<string, unknown>;
  const type = typeof cfg.type === "string" ? cfg.type : "planned_campaign";
  const audience = typeof cfg.audience === "string" ? cfg.audience : null;
  const channel = typeof cfg.channel === "string" ? cfg.channel : null;

  const insert = await db
    .from("campaigns")
    .insert({
      template_id: tpl.data.id,
      name,
      type,
      audience,
      channel,
      cities,
      start_date: startDate ?? null,
      status: "planned",
    })
    .select("id")
    .single();

  if (insert.error) {
    return NextResponse.json({ error: insert.error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, campaignId: insert.data.id });
}

