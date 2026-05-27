import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  Heart,
  ShieldCheck,
  Sparkles,
  Users,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  MessageCircle,
  ListChecks,
  Compass,
} from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card } from "@/components/ui/card";
import { BookingScheduler, BookingReminderForm } from "@/components/booking-embed";

export const metadata: Metadata = {
  title: "Book a Parent Call | TreeTots DFW",
  description:
    "Schedule a short informational call about TreeTots DFW nature-based pediatric OT groups. Talk through your child's general needs and decide on next steps.",
};

const TRUST_ITEMS = [
  { icon: Clock, label: "10–15 minute call" },
  { icon: Heart, label: "No pressure" },
  { icon: Sparkles, label: "General guidance only" },
  { icon: ShieldCheck, label: "Educational, not diagnostic" },
];

const WHO_SHOULD_BOOK = [
  {
    icon: HelpCircle,
    title: "Unsure which group fits",
    description:
      "You want help understanding which TreeTots group or service may be a good match for your child.",
  },
  {
    icon: Users,
    title: "Nature Play vs. Nature-Based OT",
    description:
      "You want to understand the difference between Nature Play Groups and Nature-Based OT Groups.",
  },
  {
    icon: Compass,
    title: "Looking for support",
    description:
      "Your child may benefit from support with regulation, transitions, confidence, motor skills, or peer participation.",
  },
  {
    icon: MessageCircle,
    title: "Provider or parent seeking guidance",
    description:
      "You are a provider or parent looking for the best next step and want to talk through options.",
  },
];

const CALL_STEPS = [
  "We ask about your child's general strengths, routines, and support needs",
  "We answer questions about TreeTots services",
  "We talk through group fit, workshop fit, or whether individual OT support may be more appropriate",
  "We explain possible next steps",
  "No diagnosis or evaluation happens during the call",
];

export default function BookCallPage() {
  return (
    <div className="pb-24">
      {/* Hero */}
      <PageHero
        eyebrow="Parent Call"
        title="Book a Parent Call"
        description="A short, supportive call to talk through your child's general needs, answer questions, and decide whether a TreeTots group, workshop, or individualized support may be a good next step."
        imageKey="otGroupHammockPlay"
        actions={[
          { href: "#schedule", label: "Schedule a Parent Call", variant: "primary" },
          { href: "/waitlist", label: "Join the Waitlist", variant: "secondary" },
        ]}
      />

      {/* Trust Row */}
      <section className="border-b border-sand/60 bg-white/70">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 px-4 py-5 sm:gap-6 lg:gap-8">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm font-medium text-forest/80">
              <Icon className="size-4 text-moss" aria-hidden />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Safety Note */}
      <section className="bg-gradient-to-b from-cream/40 to-white/30 py-6">
        <ComplianceBanner className="mx-auto max-w-3xl px-4">
          <p>
            This call is informational only. It does not establish care, diagnose
            your child, or replace an occupational therapy evaluation.
          </p>
        </ComplianceBanner>
      </section>

      {/* Scheduler Section */}
      <section id="schedule" className="scroll-mt-20 bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-6">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-semibold text-forest sm:text-4xl">
              Choose a time that works for your family
            </h2>
            <p className="mt-3 text-lg text-bark/85">
              After you schedule, you&rsquo;ll receive confirmation details by email.
            </p>
          </div>
          <BookingScheduler />
        </div>
      </section>

      {/* Who Should Book */}
      <section className="bg-cream py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <SectionHeading
            eyebrow="Is this right for you?"
            title="Who should book a call?"
            align="center"
            className="mb-10"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHO_SHOULD_BOOK.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="flex flex-col items-start gap-3 p-6">
                <span className="flex size-10 items-center justify-center rounded-full bg-sage/30">
                  <Icon className="size-5 text-forest" aria-hidden />
                </span>
                <h3 className="font-display text-lg font-semibold text-forest">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-bark/85">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What Happens on the Call */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <SectionHeading
            eyebrow="What to expect"
            title="What happens on the call?"
            align="center"
            className="mb-10"
          />
          <div className="space-y-4">
            {CALL_STEPS.map((step) => (
              <div
                key={step}
                className="flex gap-3 rounded-2xl border border-sage/20 bg-cream/40 p-4"
              >
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-moss" aria-hidden />
                <p className="text-[15px] leading-relaxed text-bark/90">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before Your Call */}
      <section className="bg-cream/60 py-14 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <SectionHeading
            eyebrow="Prepare"
            title="Before your call"
            align="center"
            className="mb-6"
          />
          <p className="mx-auto max-w-2xl text-bark/85">
            You do not need to prepare anything formal. If helpful, you can think
            about your child&rsquo;s age, daily routines, outdoor comfort, group
            experience, and any areas where you would like support.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/parent-guide"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-forest/20 bg-white/80 px-6 text-sm font-semibold text-forest transition hover:border-forest/35 hover:bg-white"
            >
              Take the Parent Guide
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
            <Link
              href="/groups"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-forest/20 bg-white/80 px-6 text-sm font-semibold text-forest transition hover:border-forest/35 hover:bg-white"
            >
              View Groups
            </Link>
            <Link
              href="/waitlist"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-forest/20 bg-white/80 px-6 text-sm font-semibold text-forest transition hover:border-forest/35 hover:bg-white"
            >
              Join the Waitlist
            </Link>
          </div>
        </div>
      </section>

      {/* Reminder Update Form */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-2xl px-4 lg:px-6">
          <div className="mb-6 text-center">
            <h2 className="font-display text-2xl font-semibold text-forest">
              Already booked?
            </h2>
            <p className="mt-2 text-bark/85">
              If you already scheduled your call, enter the same email you used so
              we can update automated reminders for that address.
            </p>
          </div>
          <BookingReminderForm />
        </div>
      </section>

      {/* Not Ready to Book */}
      <section className="bg-cream py-14 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <SectionHeading
            eyebrow="No rush"
            title="Not ready to book yet?"
            align="center"
            className="mb-4"
          />
          <p className="mx-auto mb-8 max-w-2xl text-bark/85">
            You can join the waitlist, explore group options, or use the parent
            guide to reflect on which supports may be helpful.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/waitlist"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-forest px-7 text-sm font-semibold text-cream shadow-md shadow-forest/15 transition hover:bg-forest/90 hover:shadow-lg"
            >
              Join the Waitlist
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
            <Link
              href="/groups"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-forest/20 bg-white/80 px-7 text-sm font-semibold text-forest transition hover:border-forest/35 hover:bg-white"
            >
              View Groups
            </Link>
            <Link
              href="/parent-guide"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-forest/20 bg-white/80 px-7 text-sm font-semibold text-forest transition hover:border-forest/35 hover:bg-white"
            >
              Take the Parent Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
