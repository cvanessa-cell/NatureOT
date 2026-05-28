import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const PatchSchema = z.object({
  action: z.enum(["approve_schedule", "mark_published"]),
  scheduledDate: z.string().optional(),
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
  const { data: asset } = await db
    .from("content_assets")
    .select("id,compliance_status,status")
    .eq("id", id)
    .maybeSingle();

  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (parsed.data.action === "approve_schedule") {
    if (asset.compliance_status === "high_risk" || asset.compliance_status === "do_not_use") {
      return NextResponse.json(
        { error: "Cannot schedule content flagged high risk or do not use" },
        { status: 400 }
      );
    }
    const { error } = await db
      .from("content_assets")
      .update({
        status: "scheduled",
        compliance_status: "approved",
        scheduled_date: parsed.data.scheduledDate ?? new Date().toISOString().slice(0, 10),
      })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const { error } = await db
    .from("content_assets")
    .update({
      status: "published",
      published_date: new Date().toISOString().slice(0, 10),
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
