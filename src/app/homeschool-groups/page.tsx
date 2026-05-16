import type { Metadata } from "next";
import Link from "next/link";
import { WaitlistForm } from "@/components/waitlist-form";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";

export const metadata: Metadata = {
  title: "Homeschool Groups | TreeTotsNatureOT",
  description:
    "Nature-based OT and developmental groups for homeschool families in DFW. Educational and supportive—no diagnosis-targeting language.",
};

export default function HomeschoolGroupsPage() {
  return (
    <div>
      <section className="border-b border-sand/80 bg-gradient-to-b from-cream to-white/50 px-4 py-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-moss">Homeschool</p>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl font-semibold text-forest sm:text-5xl">
            Nature-Based OT and Developmental Groups for Homeschool Families in DFW
          </h1>
          <p className="font-lead mx-auto mt-4 max-w-2xl text-lg text-bark/90">
            Weekday outdoor groups designed to support movement, regulation, confidence, social participation, and everyday functional skills
            through child-centered nature play.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
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

