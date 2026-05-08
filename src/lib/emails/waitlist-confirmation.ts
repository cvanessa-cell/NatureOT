import { appBaseUrl } from "@/lib/env";

export function waitlistConfirmationEmail(params: {
  parentName: string;
  unsubscribeHint: string;
}): { subject: string; html: string } {
  const base = appBaseUrl();
  return {
    subject: "You are on the Nature OT Growth OS waitlist",
    html: `
      <p>Hi ${escape(params.parentName)},</p>
      <p>Thank you for joining our group waitlist for nature-based pediatric occupational therapy programming in Texas.</p>
      <p>This message is informational only and does not establish care or guarantee a spot. Availability and fit vary by season and location.</p>
      <p>You may receive occasional updates. ${params.unsubscribeHint}</p>
      <p style="font-size:12px;color:#555"><a href="${base}/privacy">Privacy</a></p>
    `,
  };
}

function escape(s: string): string {
  return s.replace(/</g, "").slice(0, 200);
}
