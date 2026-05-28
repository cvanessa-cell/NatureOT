import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const BodySchema = z.object({
  title: z.string().min(1),
  platform: z
    .enum([
      "facebook",
      "instagram",
      "google_business_profile",
      "email",
      "blog",
      "flyer",
      "community_calendar",
      "other",
    ])
    .optional()
    .default("other"),
  targetAudience: z.string().optional(),
  publishAt: z.string().optional(),
  caption: z.string().optional(),
  notes: z.string().optional(),
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
  const db = createAdminClient();
  const { data, error } = await db
    .from("content_calendar_posts")
    .insert({
      title: v.title,
      platform: v.platform,
      target_audience: v.targetAudience || null,
      publish_at: v.publishAt || null,
      caption: v.caption || null,
      notes: v.notes || null,
      status: "idea",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, postId: data.id });
}
