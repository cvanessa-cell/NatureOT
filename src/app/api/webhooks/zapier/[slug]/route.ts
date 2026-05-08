import { NextResponse } from "next/server";
import { handleZapierInboundPost } from "@/lib/zapier/handle-zapier-inbound-post";

const ALLOWED_SEGMENTS = new Set([
  "lead-created",
  "waitlist-created",
  "workshop-registration",
  "booking-created",
  "feedback-submitted",
  "unsubscribe",
  "error-log",
]);

/** Zapier Catch Hook inbound → Growth OS audit log (verified by ZAPIER_WEBHOOK_SECRET). */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await ctx.params;
  if (!ALLOWED_SEGMENTS.has(slug)) {
    return NextResponse.json({ error: "Unknown webhook segment" }, { status: 404 });
  }

  try {
    return await handleZapierInboundPost(slug, req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
