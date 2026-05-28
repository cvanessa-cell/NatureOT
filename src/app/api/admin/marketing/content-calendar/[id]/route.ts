import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const PatchSchema = z.object({
  status: z.enum(["idea", "draft", "approved", "scheduled", "published", "archived"]).optional(),
});

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  idea: ["draft", "archived"],
  draft: ["approved", "archived"],
  approved: ["scheduled", "archived"],
  scheduled: ["published", "draft"],
  published: ["archived"],
  archived: ["idea"],
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { privileged, user } = await getPrivilegedSession();
  if (!privileged || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = PatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !parsed.data.status) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const db = createAdminClient();
  const { data: row } = await db
    .from("content_calendar_posts")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const next = parsed.data.status;
  const allowed = ALLOWED_TRANSITIONS[row.status] ?? [];
  if (!allowed.includes(next) && row.status !== next) {
    return NextResponse.json(
      { error: `Cannot move from ${row.status} to ${next}. Use the workflow order.` },
      { status: 400 }
    );
  }

  const { error } = await db
    .from("content_calendar_posts")
    .update({ status: next })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
