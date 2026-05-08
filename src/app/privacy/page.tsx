import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy | Texas Nature OT",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-14 text-bark/90">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
        Privacy policy
      </h1>
      <p className="text-sm text-bark/80">Last updated: May 4, 2026</p>
      <p>
        Texas Nature OT (“we,” “us”) respects your privacy. This policy
        describes how we collect, use, and share information when you use our
        website and related communications.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-xl text-forest">What we collect</h2>
      <ul className="list-inside list-disc space-y-2">
        <li>
          Parent or caregiver contact details you choose to provide (such as
          name, email, optional phone, general location, and age range for a
          child — not date of birth).
        </li>
        <li>
          Responses to our educational parent guide and general concerns you
          describe in your own words.
        </li>
        <li>
          Technical data such as IP address, browser type, and timestamps for
          security and consent records.
        </li>
      </ul>
      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-xl text-forest">What we do not collect in this marketing funnel</h2>
      <p>
        We do not ask for a child&rsquo;s full name, diagnosis, medical records,
        or other protected health information for marketing purposes. Please do
        not include that information in forms or emails unless we have
        established an appropriate clinical relationship and secure channels.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-xl text-forest">How we use information</h2>
      <ul className="list-inside list-disc space-y-2">
        <li>To respond to inquiries and schedule informational calls.</li>
        <li>
          To send educational emails or optional SMS when you have opted in.
        </li>
        <li>To measure engagement (such as email opens/clicks) where supported.</li>
        <li>To comply with law and protect safety and security.</li>
      </ul>
      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-xl text-forest">Consent records</h2>
      <p>
        When you opt in to marketing messages, we store the time of consent, the
        source (for example, which form you used), and the IP address associated
        with the request where available.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-xl text-forest">Unsubscribe</h2>
      <p>
        You may unsubscribe from marketing emails using the link in any message.
        You may also contact us through information shown on our website.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-xl text-forest">Sharing</h2>
      <p>
        We use service providers (such as email delivery and database hosting)
        under contractual safeguards. We do not sell your personal information.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-xl text-forest">Retention</h2>
      <p>
        We retain information as long as needed for the purposes above and as
        required by law. You may request access or deletion subject to legal
        exceptions.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-xl text-forest">Contact</h2>
      <p>
        For privacy questions, contact us using the information posted on our
        official site for Texas Nature OT.
      </p>
    </article>
  );
}
