import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import {
  WorkshopCards,
  WorkshopRegistrationSection,
} from "@/components/workshop-registration-form";

export const metadata: Metadata = {
  title: "Parent Workshops | Nature OT Growth OS",
  description:
    "Outdoor-forward parent workshops led with pediatric OT expertise—education, not diagnosis.",
};

export default function WorkshopsPage() {
  return (
    <div>
      <section className="border-b border-sand/80 bg-gradient-to-b from-cream to-white/50 px-4 py-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-sage">
            Events
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl font-semibold text-forest sm:text-5xl">
            Parent Workshops
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-bark/90">
            Workshops are lead-generation and education events—helpful context for
            families exploring outdoor OT supports. They do not replace individual
            evaluation or clinical care.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionHeading
          align="center"
          eyebrow="Upcoming themes"
          title="Workshops built around real outdoor routines"
        />
        <div className="mt-10">
          <WorkshopCards />
        </div>
      </section>

      <section id="register" className="border-t border-sand/80 bg-white/60 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
              Save your seat
            </h2>
            <p className="mt-4 text-bark/90">
              Choose a workshop theme and share minimum necessary contact details.
              We will confirm logistics as dates finalize.
            </p>
            <ComplianceBanner className="mt-8">
              <p>
                Dates and venues here are placeholders—swap with your operational calendar when ready.
              </p>
            </ComplianceBanner>
            <div className="mt-8 space-y-3">
              <Link href="/waitlist" className="block font-semibold text-sage underline">
                Prefer ongoing updates? Join the waitlist
              </Link>
              <Link href="/book-call" className="block font-semibold text-sage underline">
                Book a short parent call
              </Link>
            </div>
          </div>
          <WorkshopRegistrationSection />
        </div>
      </section>
    </div>
  );
}
