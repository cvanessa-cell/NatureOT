import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const PatchSchema = z.object({
  status: z.enum(["planned", "generated", "reviewed", "approved", "published"]),
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

  const patch: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "published") {
    patch.published_at = new Date().toISOString();
  }

  const db = createAdminClient();
  const { error } = await db.from("landing_pages").update(patch).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
