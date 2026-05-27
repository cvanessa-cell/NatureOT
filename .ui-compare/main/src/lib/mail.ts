import { Resend } from "resend";
import { getEnv } from "@/lib/env";

export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  html: string;
  tags?: { name: string; value: string }[];
}): Promise<{ id: string | null; error?: string }> {
  const env = getEnv();
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    console.warn("[mail] RESEND_API_KEY or EMAIL_FROM missing — email not sent");
    return { id: null, error: "email_not_configured" };
  }
  const resend = new Resend(env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
    tags: params.tags,
  });
  if (error) {
    console.error("[mail]", error);
    return { id: null, error: error.message };
  }
  return { id: data?.id ?? null };
}
