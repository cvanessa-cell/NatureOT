import { NextResponse } from "next/server";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { privileged } = await getPrivilegedSession();
  if (!privileged) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  if (!body.steps) {
    return NextResponse.json({ error: "steps required" }, { status: 400 });
  }
  try {
    const db = createAdminClient();
    const { error } = await db
      .from("email_sequences")
      .update({ steps: body.steps, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
