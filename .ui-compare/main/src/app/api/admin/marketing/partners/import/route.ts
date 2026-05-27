import { NextResponse } from "next/server";
import Papa from "papaparse";
import { z } from "zod";
import { getPrivilegedSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";

const ImportBodySchema = z.object({
  csv: z.string().min(1),
  dryRun: z.boolean().optional().default(false),
});

const OrgCsvRowSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  website: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  facebook_url: z.string().optional(),
  instagram_url: z.string().optional(),
  relevance_score: z.coerce.number().int().min(1).max(100).optional(),
  proximity_score: z.coerce.number().int().min(1).max(100).optional(),
  referral_likelihood_score: z.coerce.number().int().min(1).max(100).optional(),
  relationship_priority_score: z.coerce.number().int().min(1).max(100).optional(),
  permission_to_contact: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => {
      if (typeof v === "boolean") return v;
      if (typeof v === "string") return ["true", "1", "yes", "y"].includes(v.trim().toLowerCase());
      return undefined;
    }),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const { privileged, user } = await getPrivilegedSession();
  if (!privileged || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = ImportBodySchema.safeParse(await req.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsedBody.error.issues }, { status: 400 });
  }

  const { csv, dryRun } = parsedBody.data;

  const result = Papa.parse<Record<string, unknown>>(csv, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });

  if (result.errors?.length) {
    return NextResponse.json({ error: "CSV parse error", details: result.errors }, { status: 400 });
  }

  const rawRows = (result.data ?? []).filter((r) => Object.keys(r).some((k) => String(r[k] ?? "").trim().length > 0));

  const rows: Array<Record<string, unknown>> = [];
  const rejected: { index: number; reason: string }[] = [];

  rawRows.forEach((r, i) => {
    const normalized = Object.fromEntries(
      Object.entries(r).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
    );
    const parsed = OrgCsvRowSchema.safeParse(normalized);
    if (!parsed.success) {
      rejected.push({ index: i, reason: parsed.error.issues[0]?.message ?? "Invalid row" });
      return;
    }
    const v = parsed.data;
    rows.push({
      name: v.name,
      category: v.category,
      website: v.website || null,
      email: v.email || null,
      phone: v.phone || null,
      city: v.city || null,
      county: v.county || null,
      facebook_url: v.facebook_url || null,
      instagram_url: v.instagram_url || null,
      relevance_score: v.relevance_score ?? 50,
      proximity_score: v.proximity_score ?? 50,
      referral_likelihood_score: v.referral_likelihood_score ?? 50,
      relationship_priority_score: v.relationship_priority_score ?? 50,
      permission_to_contact: v.permission_to_contact ?? false,
      notes: v.notes || null,
    });
  });

  if (dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, accepted: rows.length, rejected });
  }

  const db = createAdminClient();

  // MVP: insert rows; de-dupe best-effort by (name, website) within the payload.
  const dedupKey = (r: Record<string, unknown>) =>
    `${String(r.name ?? "").toLowerCase()}|${String(r.website ?? "").toLowerCase()}`;
  const seen = new Set<string>();
  const deduped = rows.filter((r) => {
    const k = dedupKey(r);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const { error } = await db.from("organizations").insert(deduped);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    inserted: deduped.length,
    rejected,
  });
}

