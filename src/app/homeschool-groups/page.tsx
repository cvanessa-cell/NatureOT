import type { Metadata } from "next";
import Link from "next/link";
import { WaitlistForm } from "@/components/waitlist-form";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Homeschool Groups | TreeTots DFW",
  description:
    "Nature-based OT and developmental groups for homeschool families in DFW. Educational and supportive—no diagnosis-targeting language.",
};

export default function HomeschoolGroupsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Homeschool"
        title="Nature-based OT and developmental groups for homeschool families"
        description="Weekday outdoor groups designed to support movement, regulation, confidence, social participation, and everyday functional skills through child-centered nature play."
        imageKey="homeschoolNature"
        imagePosition="50% 40%"
        actions={[
          { href: "#homeschool-interest", label: "Join the homeschool list" },
          { href: "/book-call", label: "Book a parent call", variant: "secondary" },
        ]}
      />

      <section id="homeschool-interest" className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <h2 className="font-display text-3xl text-forest">
              Join the homeschool interest list
            </h2>
            <p className="mt-4 text-bark/90">
              Share basic preferences so we can suggest schedule options as cohorts form.
            </p>
            <ComplianceBanner className="mt-8">
              <p>
                This form is minimum-necessary and non-clinical. Please avoid detailed medical history or diagnoses here.
              </p>
            </ComplianceBanner>
            <div className="mt-8 space-y-3 text-sm">
              <Link href="/parent-guide" className="block font-semibold text-moss underline">
                Download the parent guide
              </Link>
              <Link href="/book-call" className="block font-semibold text-moss underline">
                Book a parent call
              </Link>
            </div>
          </div>
          <WaitlistForm />
        </div>
      </section>
    </div>
  );
}

