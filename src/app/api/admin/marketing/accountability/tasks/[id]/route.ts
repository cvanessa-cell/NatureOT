import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const PatchSchema = z.object({
  status: z
    .enum([
      "not_started",
      "in_progress",
      "waiting",
      "needs_review",
      "complete",
      "blocked",
      "missed",
      "deferred",
    ])
    .optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  notes: z.string().optional(),
});

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
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status === "complete") {
    patch.completed_at = new Date().toISOString();
  }

  const db = createAdminClient();
  const { error } = await db.from("accountability_tasks").update(patch).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
