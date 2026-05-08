import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of use | Texas Nature OT",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-14 text-bark/90">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
        Terms of use
      </h1>
      <p className="text-sm text-bark/80">Last updated: May 4, 2026</p>
      <p>
        By using this website, you agree to these terms. If you do not agree,
        please do not use the site.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-xl text-forest">Educational information only</h2>
      <p>
        Content on this site, including the parent guide, is for general
        education. It is not medical advice, diagnosis, or treatment, and it
        is not an occupational therapy evaluation.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-xl text-forest">No guarantees</h2>
      <p>
        We do not guarantee any particular outcome from programs, groups, or
        outdoor activities. Individual results vary.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-xl text-forest">Not an emergency service</h2>
      <p>
        This site is not monitored as a crisis or emergency line. If you or
        someone else is in immediate danger, call your local emergency number.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-xl text-forest">Scheduling and communications</h2>
      <p>
        Booking tools may be provided by third parties (such as Cal.com or
        Calendly). Their terms also apply when you use those features.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-xl text-forest">Acceptable use</h2>
      <p>
        Do not misuse the site, attempt unauthorized access, or use automated
        means to scrape or overload our systems.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-xl text-forest">Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Texas Nature OT is not liable
        for indirect or consequential damages arising from use of the site.
      </p>
      <h2 className="mt-8 font-[family-name:var(--font-fraunces)] text-xl text-forest">Updates</h2>
      <p>
        We may update these terms from time to time. Continued use after changes
        constitutes acceptance of the updated terms.
      </p>
    </article>
  );
}
