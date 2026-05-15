import { WaitlistForm } from "@/components/waitlist-form";
import type { Metadata } from "next";
import Link from "next/link";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";

export const metadata: Metadata = {
  title: "Join the Waitlist | Nature OT Growth OS",
  description:
    "Minimum-necessary waitlist for nature-based pediatric occupational therapy groups in Texas.",
};

export default function WaitlistPage() {
  return (
    <div>
      <section className="border-b border-sand/80 bg-gradient-to-b from-cream to-white/50 px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-moss">
            Waitlist
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl font-semibold text-forest">
            Join the interest list
          </h1>
          <p className="mt-4 text-lg text-bark/90">
            Share preferences so we can suggest cohorts that may fit—without collecting sensitive clinical
            details on this form.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/book-call" className="font-semibold text-moss underline underline-offset-4">
              Prefer to talk first? Book a parent call
            </Link>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-xl px-4 py-12">
        <ComplianceBanner className="mb-8">
          <p>
            Waitlist records should remain minimum-necessary and non-clinical. Staff dashboards mirror this rule.
          </p>
        </ComplianceBanner>
        <WaitlistForm />
      </div>
    </div>
  );
}
