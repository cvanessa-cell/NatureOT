import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { PageHero } from "@/components/marketing/page-hero";
import {
  WorkshopCards,
  WorkshopRegistrationSection,
} from "@/components/workshop-registration-form";

export const metadata: Metadata = {
  title: "Parent Workshops | TreeTots DFW",
  description:
    "Outdoor-forward parent workshops from TreeTots DFW, led with pediatric OT expertise and designed for education.",
};

export default function WorkshopsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Events"
        title="Parent workshops built around real outdoor routines"
        description="Helpful education for families exploring outdoor OT supports. Workshops offer practical context and do not replace individual evaluation or clinical care."
        imageKey="workshopFamilies"
        imagePosition="50% 45%"
        actions={[
          { href: "#register", label: "Save your seat" },
          { href: "/waitlist", label: "Get updates", variant: "secondary" },
        ]}
      />

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
            <h2 className="font-display text-3xl text-forest">
              Save your seat
            </h2>
            <p className="mt-4 text-bark/90">
              Choose a workshop theme and share minimum necessary contact details.
              We will confirm logistics as dates finalize.
            </p>
            <ComplianceBanner className="mt-8">
              <p>
                Workshop dates and venues are announced through the interest list as the
                operational calendar is confirmed.
              </p>
            </ComplianceBanner>
            <div className="mt-8 space-y-3">
              <Link href="/waitlist" className="block font-semibold text-moss underline">
                Prefer ongoing updates? Join the waitlist
              </Link>
              <Link href="/book-call" className="block font-semibold text-moss underline">
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
