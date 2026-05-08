import { appBaseUrl } from "@/lib/env";

export function workshopRegistrationEmailHtml(payload: {
  parentName: string;
  workshopTitle: string;
}): string {
  const base = appBaseUrl().replace(/\/$/, "");
  const waitlistUrl = `${base}/waitlist`;
  const bookUrl = `${base}/book-call`;

  return `
  <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#2d3a2d;background:#f7f4ed;padding:24px;">
    <p>Hi ${escapeHtml(payload.parentName)},</p>
    <p>Thank you for registering for <strong>${escapeHtml(payload.workshopTitle)}</strong>. We&apos;ve saved your seat request for our scheduling team.</p>
    <p>This workshop shares <strong>educational</strong> strategies in a parent-forward format &mdash; it is not an occupational therapy evaluation and does not replace individualized care.</p>
    <p><strong>Next steps</strong></p>
    <ul>
      <li>We&apos;ll follow up with date and logistics as they are confirmed.</li>
      <li>Outcomes for children vary; we communicate honestly about fit and safety.</li>
    </ul>
    <p>
      <a href="${waitlistUrl}" style="display:inline-block;padding:12px 20px;border-radius:9999px;background:#2d3a2d;color:#f7f4ed;text-decoration:none;margin-right:8px;">Join the waitlist</a>
      <a href="${bookUrl}" style="display:inline-block;padding:12px 20px;border-radius:9999px;border:2px solid #5c6f5c;color:#2d3a2d;text-decoration:none;">Book a parent call</a>
    </p>
    <p style="font-size:14px;color:#4a3f35;">Prefer fewer emails? Reply or use unsubscribe links included in operational messages.</p>
  </div>`;
}

export function referralInquiryConfirmationEmailHtml(payload: {
  contactName: string;
  organizationName: string;
}): string {
  const base = appBaseUrl().replace(/\/$/, "");
  return `
  <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#2d3a2d;background:#f7f4ed;padding:24px;">
    <p>Hi ${escapeHtml(payload.contactName)},</p>
    <p>Thank you for reaching out on behalf of <strong>${escapeHtml(payload.organizationName)}</strong>.</p>
    <p>Nature OT Growth OS collaborates with pediatricians, schools, preschools, SLPs, PTs, counselors, homeschool groups, nature schools, libraries, parent communities, and similar partners to share structured outdoor OT groups and parent education opportunities.</p>
    <p>Our team will follow up with operational next steps appropriate for professional coordination. Marketing messages here avoid clinical guarantees &mdash; every child&apos;s journey is different.</p>
    <p style="font-size:14px;">If you arrived here by mistake, you can ignore this message.</p>
    <p><a href="${base}" style="color:#5c6f5c;">Visit the Growth OS overview</a></p>
  </div>`;
}

export function parentGuideLeadEmailHtml(payload: { parentName: string }): string {
  const base = appBaseUrl().replace(/\/$/, "");
  const downloadUrl = `${base}/api/parent-guide-download`;
  return `
  <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#2d3a2d;background:#f7f4ed;padding:24px;">
    <p>Hi ${escapeHtml(payload.parentName)},</p>
    <p>Here&apos;s your <strong>outdoor sensory activity guide starter</strong> for Texas families &mdash; practical ideas meant for caregivers, paired with pacing and safety reminders.</p>
    <p><strong>Reminder:</strong> this resource is educational. It doesn&apos;t replace an individualized occupational therapy evaluation or determine eligibility for services.</p>
    <p>
      <a href="${downloadUrl}" style="display:inline-block;padding:12px 20px;border-radius:9999px;background:#2d3a2d;color:#f7f4ed;text-decoration:none;margin-right:8px;">Download the printable guide</a>
      <a href="${base}/waitlist" style="display:inline-block;padding:12px 20px;border-radius:9999px;border:2px solid #5c6f5c;color:#2d3a2d;text-decoration:none;margin-right:8px;">Join the waitlist</a>
      <a href="${base}/book-call" style="display:inline-block;padding:12px 20px;border-radius:9999px;border:2px solid #5c6f5c;color:#2d3a2d;text-decoration:none;">Book a parent call</a>
    </p>
    <p style="font-size:13px;color:#4a3f35;">Prefer the interactive reflection? Explore the <a href="${base}/quiz">parent guide flow</a> when you&apos;re ready.</p>
  </div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
