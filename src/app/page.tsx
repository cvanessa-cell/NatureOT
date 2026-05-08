import Link from "next/link";
import type { Metadata } from "next";
import {
  Leaf,
  ShieldCheck,
  Sparkles,
  Users,
  Footprints,
  Sun,
  HeartHandshake,
  Compass,
} from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Nature-Based Pediatric OT Groups in Texas | Nature OT Growth OS",
  description:
    "Small-group outdoor occupational therapy designed to support regulation, motor confidence, peer participation, and real-life skills through guided nature play.",
};

const trust = [
  {
    title: "Licensed pediatric OT–led programming",
    body: "Structured outdoor therapeutic activities led with pediatric OT expertise—never a substitute for individualized evaluation when that is needed.",
    icon: ShieldCheck,
  },
  {
    title: "Small groups",
    body: "Careful group sizing so children get guidance, pacing, and peer practice that matches the outdoor setting.",
    icon: Users,
  },
  {
    title: "Parent-friendly support",
    body: "Clear communication about what group OT may support, what to expect outdoors, and sensible next steps.",
    icon: HeartHandshake,
  },
  {
    title: "Nature-based developmental activities",
    body: "Movement, sensory-rich play, and guided peer interaction in real outdoor contexts—not generic indoor enrichment dressed up as therapy.",
    icon: Leaf,
  },
];

const programs = [
  {
    title: "After-School Regulation Groups",
    desc: "Weekday sessions that pair movement with predictable routines for regulation and confidence.",
  },
  {
    title: "Homeschool Nature OT Groups",
    desc: "Daytime groups aligned with homeschool rhythms and outdoor learning values.",
  },
  {
    title: "Summer Nature OT Camps",
    desc: "Seasonal intensives with themes that keep groups lively while staying developmentally grounded.",
  },
  {
    title: "Parent Workshops",
    desc: "Education-forward evenings that connect families with practical outdoor strategies.",
  },
  {
    title: "Individual OT Support",
    desc: "When one-to-one care is the better next step, we help families understand options—without overpromising.",
  },
  {
    title: "Referral Partner Collaboration",
    desc: "Pediatricians, schools, and therapists receive respectful, operational updates—never confidential clinical records.",
  },
];

const steps = [
  "Join the waitlist",
  "Book a parent call",
  "Match with the right group",
  "Begin outdoor OT sessions",
  "Receive parent updates and next-step support",
];

const whoMayBenefit = [
  "Children who seek or avoid sensory input in daily routines",
  "Children building coordination or motor confidence",
  "Children working on transitions or big emotions with movement supports",
  "Children who benefit from structured peer play outdoors",
  "Children building outdoor confidence and independence with guidance",
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-sand/80 bg-gradient-to-b from-cream via-cream to-white/40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(107,143,156,0.18),_transparent_55%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:py-24">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-sage">
              Texas · nature-based groups
            </p>
            <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-fraunces)] text-4xl font-semibold leading-tight text-forest sm:text-5xl">
              Nature-Based Occupational Therapy Groups for Kids in Texas
            </h1>
            <p className="mt-6 max-w-xl text-lg text-bark/90">
              Small-group outdoor OT designed to support sensory regulation,
              motor confidence, emotional growth, social participation, and
              real-life functional skills through guided nature play.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/waitlist"
                className="inline-flex min-h-14 min-w-[12rem] items-center justify-center rounded-full bg-forest px-8 text-center text-lg font-medium text-cream shadow-md transition hover:bg-sage"
              >
                Join the Waitlist
              </Link>
              <Link
                href="/book-call"
                className="inline-flex min-h-14 min-w-[12rem] items-center justify-center rounded-full border-2 border-sage/45 bg-white/70 px-8 text-center text-lg font-medium text-forest transition hover:border-sage"
              >
                Book a Parent Call
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-bark/85">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1">
                <Sparkles className="size-4 text-sage" aria-hidden />
                Secondary: workshops & referral partners
              </span>
              <Link
                href="/workshops"
                className="inline-flex items-center rounded-full border border-sand bg-cream/60 px-3 py-1 font-medium text-forest underline-offset-4 hover:underline"
              >
                Register for a Workshop
              </Link>
              <Link
                href="/groups"
                className="inline-flex items-center rounded-full border border-sand bg-cream/60 px-3 py-1 font-medium text-forest underline-offset-4 hover:underline"
              >
                View Group Options
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl border border-sage/20 bg-gradient-to-br from-sky/25 via-cream to-moss/15 shadow-lg">
              <div className="flex h-full flex-col justify-between p-8">
                <div>
                  <p className="text-sm font-medium text-forest/80">
                    Outdoor sessions
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl text-forest">
                    Trails, grass, and confident pacing
                  </p>
                </div>
                <ul className="space-y-3 text-sm text-bark/90">
                  <li className="flex gap-2">
                    <Footprints className="mt-0.5 size-5 shrink-0 text-sage" />
                    Uneven terrain invites balance and motor planning—in a
                    supported way.
                  </li>
                  <li className="flex gap-2">
                    <Sun className="mt-0.5 size-5 shrink-0 text-sage" />
                    Sensory-rich outdoor contexts for regulation practice.
                  </li>
                  <li className="flex gap-2">
                    <Compass className="mt-0.5 size-5 shrink-0 text-sage" />
                    Real-life practice—not a promise of specific results for
                    every child.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow="For Texas families"
          title="For kids who need more movement, connection, and gentle structure"
          description="Many families are looking for outdoor opportunities that still feel safe, paced, and respectful of sensory needs. Nature-based groups can be one supportive option when the fit is right."
          align="center"
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((t) => (
            <Card key={t.title} className="h-full border-sage/15">
              <t.icon className="size-8 text-sage" aria-hidden />
              <h3 className="mt-4 font-[family-name:var(--font-fraunces)] text-lg text-forest">
                {t.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-bark/85">
                {t.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-sand/80 bg-white/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="Why outdoors"
            title="Nature supports skills parents recognize at home"
            description="Outdoor OT uses meaningful movement—not gimmicks. Sessions draw on what children already love (carrying, climbing, exploring) to practice participation and confidence."
            align="center"
          />
          <ul className="mx-auto mt-10 max-w-3xl list-inside list-disc space-y-3 text-bark/90">
            <li>Uneven terrain invites balance and coordination practice.</li>
            <li>
              Carrying, digging, and climbing support strength and motor
              planning.
            </li>
            <li>Nature provides sensory-rich experiences with gentle novelty.</li>
            <li>
              Peer moments emerge naturally—then get guided with OT structure.
            </li>
            <li>
              Real settings help children practice flexible problem-solving with
              adult support nearby.
            </li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow="Programs"
          title="Program options built around families—not one-size-fits-all hype"
          align="center"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <Card key={p.title}>
              <h3 className="font-[family-name:var(--font-fraunces)] text-xl text-forest">
                {p.title}
              </h3>
              <p className="mt-3 text-sm text-bark/85">{p.desc}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/waitlist"
                  className="text-sm font-semibold text-sage underline-offset-4 hover:underline"
                >
                  Join interest list
                </Link>
                <span className="text-bark/40">·</span>
                <Link
                  href="/parent-guide"
                  className="text-sm font-semibold text-sage underline-offset-4 hover:underline"
                >
                  Download parent guide
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-sand/80 bg-cream/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            eyebrow="How it works"
            title="A clear path—without pressure"
            align="center"
          />
          <ol className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s} className="relative rounded-2xl border border-sand bg-card/95 p-4 text-center shadow-sm">
                <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-sage/15 text-sm font-semibold text-forest">
                  {i + 1}
                </span>
                <p className="mt-3 text-sm font-medium text-forest">{s}</p>
              </li>
            ))}
          </ol>
          <ComplianceBanner className="mx-auto mt-10 max-w-3xl">
            <p>
              <strong>Educational information:</strong> This website does not
              replace an individualized occupational therapy evaluation. Group
              services may not be appropriate for every child.
            </p>
          </ComplianceBanner>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          eyebrow="Fit"
          title="Who it may support"
          description="Language below is descriptive—not a screening tool and not a diagnosis."
        />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {whoMayBenefit.map((line) => (
            <li
              key={line}
              className="rounded-2xl border border-sand bg-white/70 px-4 py-3 text-bark/90"
            >
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-sand/80 bg-forest py-16 text-cream">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold">
            Ready to explore whether a nature-based OT group may be a good fit?
          </h2>
          <p className="mt-4 text-cream/85">
            Start with the waitlist or a short parent call—whichever feels lower
            pressure for your family.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/waitlist"
              className="inline-flex min-h-14 min-w-[12rem] items-center justify-center rounded-full bg-cream px-8 text-lg font-medium text-forest shadow-md hover:bg-white"
            >
              Join the Waitlist
            </Link>
            <Link
              href="/book-call"
              className="inline-flex min-h-14 min-w-[12rem] items-center justify-center rounded-full border-2 border-cream/40 px-8 text-lg font-medium text-cream hover:bg-cream/10"
            >
              Book a Parent Call
            </Link>
          </div>
          <p className="mt-6 text-sm text-cream/75">
            Prefer the printable guide first?{" "}
            <Link className="font-semibold underline underline-offset-4" href="/parent-guide">
              Download the parent guide
            </Link>
            {" · "}
            <Link className="font-semibold underline underline-offset-4" href="/quiz">
              Try the interactive guide
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
