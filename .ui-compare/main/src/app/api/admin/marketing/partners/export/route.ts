import { NextResponse } from "next/server";
import Papa from "papaparse";
import { getStaffPortalSession } from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { portalRole, user } = await getStaffPortalSession();
  if (!user || !portalRole) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("organizations")
    .select(
      "name,category,website,email,phone,city,county,facebook_url,instagram_url,relevance_score,proximity_score,referral_likelihood_score,relationship_priority_score,priority_score,status,permission_to_contact,notes,created_at"
    )
    .order("priority_score", { ascending: false })
    .limit(5000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const csv = Papa.unparse(data ?? []);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="partners-export.csv"',
    },
  });
}

