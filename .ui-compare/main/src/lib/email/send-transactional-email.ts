import { sendTransactionalEmail } from "@/lib/mail";
import { getEnv } from "@/lib/env";

export type SendOperationalEmailInput = {
  to: string;
  subject: string;
  html: string;
  tags?: { name: string; value: string }[];
};

export type SendOperationalEmailResult = {
  resendEmailId: string | null;
  dryRun: boolean;
  skippedReason?: string;
  sendError?: string;
};

/** Respects EMAIL_DRY_RUN and missing Resend credentials without throwing. */
export async function sendOperationalEmail(
  params: SendOperationalEmailInput
): Promise<SendOperationalEmailResult> {
  const env = getEnv();

  const dryRun = env.EMAIL_DRY_RUN === "true";
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    return {
      resendEmailId: null,
      dryRun: true,
      skippedReason: "email_not_configured",
    };
  }

  if (dryRun) {
    return {
      resendEmailId: null,
      dryRun: true,
      skippedReason: "email_dry_run",
    };
  }

  const { id, error } = await sendTransactionalEmail(params);
  if (error || !id) {
    return {
      resendEmailId: null,
      dryRun: false,
      sendError: error ?? "send_failed",
    };
  }

  return { resendEmailId: id, dryRun: false };
}
