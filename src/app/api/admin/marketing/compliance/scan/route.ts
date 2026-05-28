import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffPortalSession } from "@/lib/auth-admin";
import { scanMarketingCopy } from "@/lib/marketing/compliance-scan";

const BodySchema = z.object({
  text: z.string().min(1),
});

export async function POST(req: Request) {
  const { user, portalRole } = await getStaffPortalSession();
  if (!user || !portalRole) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const result = scanMarketingCopy(parsed.data.text);
  return NextResponse.json({ ok: true, ...result });
}
