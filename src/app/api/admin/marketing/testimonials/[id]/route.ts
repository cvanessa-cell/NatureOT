import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const PatchSchema = z.object({
  authStatus: z.enum(["pending", "authorized", "denied"]).optional(),
  adminApproval: z.enum(["pending", "approved", "rejected"]).optional(),
  published: z.boolean().optional(),
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

  const db = createAdminClient();
  const { data: existing } = await db
    .from("testimonials")
    .select("auth_status,admin_approval")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const authStatus = parsed.data.authStatus ?? existing.auth_status;
  const adminApproval = parsed.data.adminApproval ?? existing.admin_approval;
  const canPublish = authStatus === "authorized" && adminApproval === "approved";

  if (parsed.data.published === true && !canPublish) {
    return NextResponse.json(
      { error: "Publish requires authorization on file and admin approval" },
      { status: 400 }
    );
  }

  const patch: Record<string, unknown> = {};
  if (parsed.data.authStatus) patch.auth_status = parsed.data.authStatus;
  if (parsed.data.adminApproval) patch.admin_approval = parsed.data.adminApproval;
  if (parsed.data.published !== undefined) {
    patch.published = parsed.data.published;
    patch.published_at = parsed.data.published ? new Date().toISOString() : null;
  }

  const { error } = await db.from("testimonials").update(patch).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
