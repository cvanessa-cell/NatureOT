import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Sparkles,
  TreePine,
  Users,
  CheckCircle2,
  Leaf,
  Sun,
  Heart,
} from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { FaqAccordion, type FaqItem } from "@/components/marketing/faq-accordion";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Nature-Based Groups for Kids in Dallas–Fort Worth | TreeTots DFW",
  description:
    "Small outdoor groups designed to support regulation, motor confidence, social participation, and playful connection through therapist-informed nature-based experiences in DFW.",
};

const trustItems = [
  { icon: Users, label: "Small group sizes" },
  { icon: TreePine, label: "Outdoor play-based structure" },
  { icon: Sparkles, label: "Parent-friendly guidance" },
  { icon: CheckCircle2, label: "Matched by age and developmental fit" },
];

const comparisonCards = [
  {
    icon: Sun,
    title: "Nature Play Groups",
    description:
      "Best for child-led outdoor play, peer connection, confidence, and exploration. Designed to support social participation and sensory curiosity in a natural setting.",
    color: "bg-sage/30",
    iconColor: "text-moss",
  },
  {
    icon: Leaf,
    title: "Nature-Based OT Groups",
    description:
      "Best for therapist-led support with regulation, motor skills, sensory processing, social participation, and transitions. Helps build everyday confidence through structured outdoor activities.",
    color: "bg-sage/20",
    iconColor: "text-forest",
  },
  {
    icon: Heart,
    title: "Homeschool Weekday Groups",
    description:
      "Best for families needing daytime rhythm, movement, regulation, and social connection. Supports routine-building and peer interaction during the school week.",
    color: "bg-cream",
    iconColor: "text-moss",
  },
];

type Group = {
  title: string;
  age: string;
  summary: string;
  bestFor: string[];
  kidsPractice: string[];
  activities: string;
  length: string;
  groupSize: string;
  ctaLabel: string;
  ctaHref: string;
};

const groups: Group[] = [
  {
    title: "Nature Explorers",
    age: "3–5",
    summary:
      "A gentle introduction to outdoor play and sensory exploration for our youngest learners.",
    bestFor: [
      "Children building comfort outdoors",
      "Early regulation and sensory curiosity",
      "First group experiences",
    ],
    kidsPractice: [
      "Navigating uneven ground",
      "Sensory-rich nature play",
      "Turn-taking with peers",
    ],
    activities: "Short hikes, carrying tools, sand/water play, partner games",
    length: "60 min",
    groupSize: "4–6 kids",
    ctaLabel: "Join Ages 3–5 Interest List",
    ctaHref: "/waitlist?group=ages-3-5",
  },
  {
    title: "Regulation + Motor Confidence",
    age: "5–7",
    summary:
      "Guided movement challenges that build coordination, transition skills, and peer confidence.",
    bestFor: [
      "Children working on transitions",
      "Coordination and motor planning",
      "Guided peer interaction",
    ],
    kidsPractice: [
      "Climbing and balancing",
      "Following multi-step directions",
      "Cooperative movement tasks",
    ],
    activities: "Climbing lines, obstacle paths, cooperative carry tasks",
    length: "75 min",
    groupSize: "4–6 kids",
    ctaLabel: "Join Ages 5–7 Interest List",
    ctaHref: "/waitlist?group=ages-5-7",
  },
  {
    title: "Outdoor Skills + Social Participation",
    age: "7–10",
    summary:
      "Team-based outdoor challenges that encourage planning, problem-solving, and leadership.",
    bestFor: [
      "Children building independence",
      "Flexible problem-solving",
      "Team-based social skills",
    ],
    kidsPractice: [
      "Orienteering and navigation",
      "Tool use and risk assessment",
      "Leading and following in groups",
    ],
    activities: "Orienteering-style games, tool use, team challenges",
    length: "75 min",
    groupSize: "4–6 kids",
    ctaLabel: "Join Ages 7–10 Interest List",
    ctaHref: "/waitlist?group=ages-7-10",
  },
  {
    title: "Homeschool Weekday Group",
    age: "Mixed",
    summary:
      "A weekday daytime rhythm for homeschool families blending regulation, motor, and nature connection.",
    bestFor: [
      "Homeschool families seeking structure",
      "Daytime weekday availability",
      "Regulation and motor blend",
    ],
    kidsPractice: [
      "Trail pacing and rhythm",
      "Nature journaling and reflection",
      "Group problem-solving",
    ],
    activities: "Trail pacing, nature journaling breaks, group challenges",
    length: "75 min",
    groupSize: "4–8 kids",
    ctaLabel: "Join Homeschool Group Interest List",
    ctaHref: "/waitlist?group=homeschool",
  },
];

const faq: FaqItem[] = [
  {
    id: "1",
    q: "What happens in a session?",
    a: "Sessions blend therapist-guided activities with child-led exploration — always within safety and group agreements. You will receive parent-facing language about themes, not confidential clinical documentation on this marketing site.",
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
    a: "Eligibility and clinical appropriateness are determined through your intake process — not by this website. Some children need individual evaluation before group placement.",
  },
  {
    id: "6",
    q: "How are groups formed?",
    a: "We consider age, developmental needs, schedule, safety, and social fit. Outcomes vary by child; we do not guarantee placement.",
  },
];

function GroupCard({ group }: { group: Group }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[1.75rem] border border-sand/70 bg-white shadow-sm shadow-forest/5 transition hover:shadow-md hover:shadow-forest/8">
      <div className="flex flex-wrap items-center gap-3 border-b border-sand/50 bg-gradient-to-r from-cream to-sage/15 px-5 py-3.5 sm:px-6 sm:py-4">
        <span className="inline-flex items-center rounded-full bg-forest px-3 py-1 text-xs font-bold uppercase tracking-wide text-cream">
          Ages {group.age}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-forest/60">
          <Clock className="size-3.5" aria-hidden />
          {group.length}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-forest/60">
          <Users className="size-3.5" aria-hidden />
          {group.groupSize}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
        <h3 className="font-display text-xl font-semibold text-forest sm:text-[1.35rem]">
          {group.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-bark/85">
          {group.summary}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-moss">
              Best for
            </p>
            <ul className="space-y-1.5">
              {group.bestFor.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-forest/75"
                >
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-moss/60"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-moss">
              Kids practice
            </p>
            <ul className="space-y-1.5">
              {group.kidsPractice.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-forest/75"
                >
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sage"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-5 text-xs text-forest/55">
          <span className="font-medium text-forest/70">Typical activities:</span>{" "}
          {group.activities}
        </p>

        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href={group.ctaHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-forest px-6 text-sm font-semibold text-cream shadow-sm transition hover:bg-forest/90 hover:shadow-md"
          >
            {group.ctaLabel}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
          <Link
            href="/book-call"
            className="text-center text-sm font-medium text-moss underline underline-offset-4 hover:text-forest sm:text-left"
          >
            Ask if this group is a fit
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function GroupsPage() {
  return (
    <>
      {/* Hero */}
      <PageHero
        eyebrow="Programs"
        title="Nature-Based Groups for Kids in Dallas–Fort Worth"
        description="Small outdoor groups designed to support regulation, motor confidence, social participation, confidence, and playful connection through therapist-informed nature-based experiences."
        imageKey="naturePlayChildOnLog"
        imagePosition="50% 35%"
        actions={[
          { href: "/waitlist", label: "Join the Waitlist" },
          {
            href: "/book-call",
            label: "Book a Parent Call",
            variant: "secondary",
          },
        ]}
      />

      {/* Trust row */}
      <div className="border-b border-sand/70 bg-cream/60">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4">
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-sm text-forest/70"
            >
              <item.icon className="size-4 text-moss" aria-hidden />
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Find the Right Group intro */}
      <section
        className="bg-ivory py-14 lg:py-20"
        aria-labelledby="find-right-group-heading"
      >
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-moss">
              For Parents
            </p>
            <h2
              id="find-right-group-heading"
              className="mt-3 font-display text-3xl font-semibold text-forest sm:text-4xl"
            >
              Find the Right Group
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-bark/85">
              Each group is designed around a different kind of support. Here is
              a quick overview to help you start thinking about which one may be
              the best fit for your child.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {comparisonCards.map((card) => (
              <div
                key={card.title}
                className="flex flex-col rounded-[1.75rem] border border-sage/45 bg-white/80 p-6 shadow-sm shadow-forest/5 transition hover:shadow-md"
              >
                <span
                  className={`flex size-11 items-center justify-center rounded-full ${card.color}`}
                >
                  <card.icon
                    className={`size-5 ${card.iconColor}`}
                    aria-hidden
                  />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-forest">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-bark/80">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Group cards */}
      <section
        className="mx-auto max-w-6xl px-4 py-14 lg:px-6 lg:py-20"
        aria-labelledby="explore-groups-heading"
      >
        <SectionHeading
          align="center"
          eyebrow="Explore Our Groups"
          title="Age-Matched Groups Designed Around Your Child"
          description="Browse below to learn more about each group, what kids practice, and how to join the interest list."
        />
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {groups.map((g) => (
            <GroupCard key={g.title} group={g} />
          ))}
        </div>
      </section>

      {/* Not sure which group fits? */}
      <section className="border-y border-sand/70 bg-gradient-to-b from-cream to-white/60 py-14 lg:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-display text-3xl font-semibold text-forest sm:text-4xl">
            Not sure which group is the best fit?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-bark/85">
            Every child develops at their own pace. If you are unsure where to
            start, book a parent call and we can help you decide whether a group,
            parent-child workshop, or individualized OT support may be the best
            next step.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/book-call"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest px-8 text-sm font-semibold text-cream shadow-sm transition hover:bg-forest/90 hover:shadow-md"
            >
              Book a Parent Call
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
            <Link
              href="/waitlist"
              className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-forest/20 bg-white/80 px-8 text-sm font-semibold text-forest transition hover:border-forest/35 hover:bg-white"
            >
              Join the Waitlist
            </Link>
          </div>
        </div>
      </section>

      {/* Safety and fit note */}
      <section className="mx-auto max-w-3xl px-4 py-10">
        <ComplianceBanner>
          <p>
            Groups are designed around age, developmental fit, safety, and
            participation needs. Some children may benefit from an individual
            evaluation or 1:1 support before joining a group. This information
            is educational and does not determine eligibility or replace an
            individualized evaluation.
          </p>
        </ComplianceBanner>
      </section>

      {/* FAQ */}
      <section
        className="border-t border-sand/70 bg-ivory py-14 lg:py-20"
        aria-labelledby="groups-faq-heading"
      >
        <div className="mx-auto max-w-3xl px-4">
          <SectionHeading
            align="center"
            eyebrow="FAQ"
            title="Questions families ask before the first visit"
          />
          <FaqAccordion className="mt-8" items={faq} />
        </div>
      </section>
    </>
  );
}
