import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const BodySchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  campaignId: z.string().uuid().optional(),
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
    .from("accountability_tasks")
    .insert({
      title: v.title,
      category: v.category,
      description: v.description || null,
      due_date: v.dueDate || null,
      priority: v.priority,
      campaign_id: v.campaignId || null,
      status: "not_started",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, taskId: data.id });
}
