import { NextResponse } from "next/server";
import { assertZapierWebhookSecret, logZapierInbound } from "./zapier-inbound";

/** Shared POST handler for Zapier → app webhooks after secret verification. */
export async function handleZapierInboundPost(
  routeSegment: string,
  req: Request
): Promise<Response> {
  const check = assertZapierWebhookSecret(req);
  if (!check.ok) {
    return NextResponse.json({ error: check.message }, { status: check.status });
  }

  const rawBody = await req.json().catch(() => ({}));

  await logZapierInbound({ routeSegment, rawBody }).catch(() => {});

  return NextResponse.json({ ok: true, recorded: true });
}
