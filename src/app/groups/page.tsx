import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { FaqAccordion, type FaqItem } from "@/components/marketing/faq-accordion";
import { Card } from "@/components/ui/card";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";

export const metadata: Metadata = {
  title: "Small-Group Nature-Based OT Programs | Nature OT Growth OS",
  description:
    "Explore age-banded outdoor OT groups in Texas—structure, focus areas, and how we match families.",
};

const groups = [
  {
    title: "Ages 3–5 Nature Explorers",
    age: "3–5",
    focus: "Sensory exploration, early regulation, confidence with uneven terrain",
    activities: "Short hikes, carrying tools, sand/water play, partner games",
    length: "60 minutes",
    size: "4–6 children",
  },
  {
    title: "Ages 5–7 Regulation + Motor Confidence",
    age: "5–7",
    focus: "Transitions, coordination challenges, peer practice with guidance",
    activities: "Climbing lines, obstacle paths, cooperative carry tasks",
    length: "75 minutes",
    size: "5–7 children",
  },
  {
    title: "Ages 7–10 Outdoor Skills + Social Participation",
    age: "7–10",
    focus: "Planning, teamwork, outdoor confidence, flexible problem-solving",
    activities: "Orienteering-style games, tool use, team challenges",
    length: "75 minutes",
    size: "6–8 children",
  },
  {
    title: "Homeschool Weekday Group",
    age: "Mixed (matched cohorts)",
    focus: "Daytime rhythm for homeschool families; regulation + motor blend",
    activities: "Trail pacing, nature journaling breaks, group challenges",
    length: "75 minutes",
    size: "Varies by cohort",
  },
  {
    title: "After-School Regulation Group",
    age: "Typically 5–10 (matched)",
    focus: "End-of-day regulation supports after school demands",
    activities: "Heavy work sequences, cool-down trails, peer reflection prompts",
    length: "60–75 minutes",
    size: "6–8 children",
  },
  {
    title: "Summer Nature OT Camp",
    age: "Varies by week",
    focus: "Thematic weeks that keep movement central—without promising outcomes",
    activities: "Camp-style rotations with OT-led stations outdoors",
    length: "Half-day blocks",
    size: "Cohort-based",
  },
];

const faq: FaqItem[] = [
  {
    id: "1",
    q: "What happens in a session?",
    a: "Sessions blend therapist-guided activities with child-led exploration—always within safety and group agreements. You will receive parent-facing language about themes, not confidential clinical documentation on this marketing site.",
  },
  {
    id: "2",
    q: "What should my child wear?",
    a: "Closed-toe shoes, weather-appropriate layers, sun protection, and clothes that can get dirty. We share a packing list after you connect with our team.",
  },
  {
    id: "3",
    q: "What happens in bad weather?",
    a: "We monitor conditions closely. Sessions may move to a sheltered outdoor area, reschedule, or pause when safety requires it.",
  },
  {
    id: "4",
    q: "Is this a replacement for school OT?",
    a: "No. School-based OT addresses IEP goals in the educational setting. Our groups are separate and serve different purposes. Many families use both when appropriate.",
  },
  {
    id: "5",
    q: "Do we need an evaluation first?",
    a: "Eligibility and clinical appropriateness are determined through your intake process—not by this website. Some children need individual evaluation before group placement.",
  },
  {
    id: "6",
    q: "How are groups formed?",
    a: "We consider age, developmental needs, schedule, safety, and social fit. Outcomes vary by child; we do not guarantee placement.",
  },
];

export default function GroupsPage() {
  return (
    <div>
      <section className="border-b border-sand/80 bg-gradient-to-b from-cream to-white/50 px-4 py-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-moss">
            Programs
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl font-semibold text-forest sm:text-5xl">
            Small-Group Nature-Based OT Programs
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-bark/90">
            Age-banded cohorts with transparent focus areas. Groups are not
            appropriate for every child; fit is determined through your intake
            conversation and clinical judgment—not by browsing alone.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/waitlist"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-8 font-medium text-cream"
            >
              Join Interest List
            </Link>
            <Link
              href="/book-call"
              className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-sage/40 px-8 font-medium text-forest"
            >
              Book a Parent Call
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {groups.map((g) => (
            <Card key={g.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-moss">
                Ages {g.age}
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl text-forest">
                {g.title}
              </h2>
              <dl className="mt-4 space-y-2 text-sm text-bark/90">
                <div>
                  <dt className="font-medium text-forest">Focus</dt>
                  <dd>{g.focus}</dd>
                </div>
                <div>
                  <dt className="font-medium text-forest">Typical activities</dt>
                  <dd>{g.activities}</dd>
                </div>
                <div>
                  <dt className="font-medium text-forest">Session length</dt>
                  <dd>{g.length}</dd>
                </div>
                <div>
                  <dt className="font-medium text-forest">Group size</dt>
                  <dd>{g.size}</dd>
                </div>
              </dl>
              <Link
                href="/waitlist"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-sage/15 px-5 text-sm font-semibold text-forest hover:bg-sage/25"
              >
                Join Interest List
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-sand/80 bg-white/60 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading
            title="How we match families"
            description="Groups form based on age, developmental needs, schedule, safety, and social fit. We communicate clearly when a different service level—individual OT or community supports—may be a better next step."
          />
          <ComplianceBanner className="mt-8">
            <p>
              This information is educational and does not determine eligibility or
              replace an individualized evaluation.
            </p>
          </ComplianceBanner>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <SectionHeading
          align="center"
          eyebrow="FAQ"
          title="Questions families ask before the first visit"
        />
        <FaqAccordion className="mt-8" items={faq} />
      </section>
    </div>
  );
}
