import type { Metadata } from "next";
import Link from "next/link";
import { WaitlistForm } from "@/components/waitlist-form";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { FaqAccordion, type FaqItem } from "@/components/marketing/faq-accordion";
import { PageHero } from "@/components/marketing/page-hero";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Homeschool Groups | TreeTots DFW",
  description:
    "Nature-based OT and developmental groups for homeschool families in DFW. Educational and supportive without diagnosis-targeting language.",
};

const homeschoolRhythms = [
  {
    title: "Movement woven into the school week",
    description:
      "Weekday outdoor groups can complement homeschool routines with therapist-led movement, transitions, and practical regulation support.",
  },
  {
    title: "Social participation with gentle structure",
    description:
      "Cohorts are designed to support shared play, peer problem-solving, and confidence in outdoor group settings without overpromising outcomes.",
  },
  {
    title: "A parent-facing next step",
    description:
      "Families can start with the homeschool interest list, a short parent call, or the educational parent guide before deciding whether a group inquiry is the right fit.",
  },
];

const homeschoolFaq: FaqItem[] = [
  {
    id: "schedule-fit",
    q: "How can a homeschool group fit into our week?",
    a: "Families often use these groups as one steady outdoor anchor during the week. We ask about preferred days and times so we can form cohorts around real family schedules rather than making blanket promises.",
  },
  {
    id: "who-benefits",
    q: "What kinds of families usually ask about this?",
    a: "Many parents reach out when they want support for regulation, motor confidence, transitions, outdoor confidence, or social participation. The website does not determine eligibility, and we avoid using the inquiry form as a clinical screening tool.",
  },
  {
    id: "next-step",
    q: "What is the best first step if I am not sure yet?",
    a: "If you are early in the decision, the parent guide can give context and the parent call can help you talk through fit. If you already know you want homeschool group updates, the interest list is the fastest path.",
  },
];

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

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-moss">
            Homeschool campaign focus
          </p>
          <h2 className="mt-3 font-display text-3xl text-forest sm:text-4xl">
            Built for families who want support that fits a homeschool rhythm
          </h2>
          <p className="mt-4 text-bark/90">
            This page is designed for parents who want a warm, low-pressure path from
            curiosity to inquiry. It explains how weekday nature-based OT groups can fit
            into real homeschool routines while keeping the next step simple and
            privacy-aware.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {homeschoolRhythms.map((item) => (
            <Card key={item.title} className="h-full">
              <h3 className="font-display text-2xl text-forest">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-bark/90">
                {item.description}
              </p>
            </Card>
          ))}
        </div>

        <ComplianceBanner className="mt-8">
          <p>
            We keep this page educational and operational. It does not promise
            placement, outcomes, or clinical recommendations from web browsing alone.
          </p>
        </ComplianceBanner>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="#homeschool-interest"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-6 text-sm font-semibold text-cream transition hover:bg-forest/90"
          >
            Join the homeschool list
          </Link>
          <Link
            href="/parent-guide"
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-forest/20 bg-white/80 px-6 text-sm font-semibold text-forest transition hover:border-forest/35 hover:bg-white"
          >
            Get the parent guide
          </Link>
        </div>
      </section>

      <section className="border-y border-sand/80 bg-white/60 py-14">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center font-display text-3xl text-forest">
            Questions homeschool families ask before they inquire
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-bark/90">
            The goal here is to reduce hesitation and move families toward the right
            inquiry path without pushing them into a form that collects more than it
            should.
          </p>
          <FaqAccordion className="mt-8" items={homeschoolFaq} />
        </div>
      </section>

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
                This form is minimum-necessary and non-clinical. Please avoid detailed
                medical history or diagnoses here.
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
