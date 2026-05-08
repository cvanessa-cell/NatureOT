import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEnv } from "@/lib/env";

type ResendPayload = {
  type?: string;
  data?: {
    email_id?: string;
    to?: string[];
    click?: { link?: string };
  };
};

export async function POST(req: Request) {
  const env = getEnv();
  const raw = await req.text();
  if (env.RESEND_WEBHOOK_SECRET) {
    const sig = req.headers.get("svix-signature");
    if (!sig) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }
  }

  let body: ResendPayload;
  try {
    body = JSON.parse(raw) as ResendPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emailId = body.data?.email_id;
  const eventType = mapEvent(body.type);
  if (!emailId || !eventType) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("email_events")
    .select("lead_id")
    .eq("resend_email_id", emailId)
    .limit(1)
    .maybeSingle();

  let leadId = existing?.lead_id as string | undefined;
  if (!leadId) {
    leadId = undefined;
  }

  await supabase.from("email_events").insert({
    lead_id: leadId ?? null,
    resend_email_id: emailId,
    event_type: eventType,
    metadata: { raw_type: body.type, click: body.data?.click },
  });

  return NextResponse.json({ ok: true });
}

function mapEvent(t?: string): string | null {
  if (!t) return null;
  if (t.includes("delivered")) return "delivered";
  if (t.includes("open")) return "opened";
  if (t.includes("click")) return "clicked";
  if (t.includes("bounce")) return "bounced";
  if (t.includes("complaint")) return "complained";
  return t;
}
