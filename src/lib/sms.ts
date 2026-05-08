/**
 * SMS via Twilio REST API — credentials come only from environment variables
 * (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER). No keys in code.
 */

export type SmsSendResult =
  | { ok: true; providerMessageId?: string }
  | { ok: false; error: string; code: "not_configured" | "send_failed" };

export async function sendSmsIfConfigured(params: {
  toE164: string;
  body: string;
}): Promise<SmsSendResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    return { ok: false, error: "SMS provider not configured", code: "not_configured" };
  }

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const body = new URLSearchParams({
      From: from,
      To: params.toE164,
      Body: params.body,
    });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );
    const json = (await res.json()) as { sid?: string; message?: string };
    if (!res.ok) {
      return {
        ok: false,
        error: json.message ?? res.statusText,
        code: "send_failed",
      };
    }
    return { ok: true, providerMessageId: json.sid };
  } catch (e) {
    const err = e instanceof Error ? e.message : "unknown_error";
    return { ok: false, error: err, code: "send_failed" };
  }
}
