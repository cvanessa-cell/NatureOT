import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const BodySchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  website: z
    .string()
    .optional()
    .transform((s) => (s?.trim() ? s.trim() : undefined))
    .pipe(z.string().url().optional()),
  email: z
    .string()
    .optional()
    .transform((s) => (s?.trim() ? s.trim() : undefined))
    .pipe(z.string().email().optional()),
  phone: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  permissionToContact: z.boolean().optional().default(false),
  notes: z.string().optional(),
  status: z
    .enum([
      "not_researched",
      "researched",
      "ready_for_outreach",
      "first_message_sent",
      "partner_interested",
      "active_referral_partner",
    ])
    .optional()
    .default("not_researched"),
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
    .from("organizations")
    .insert({
      name: v.name,
      category: v.category,
      website: v.website || null,
      email: v.email || null,
      phone: v.phone || null,
      city: v.city || null,
      county: v.county || null,
      permission_to_contact: v.permissionToContact,
      notes: v.notes || null,
      status: v.status,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, organizationId: data.id });
}
