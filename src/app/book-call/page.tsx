import { BookingEmbed } from "@/components/booking-embed";
import type { Metadata } from "next";
import Link from "next/link";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Book a Parent Call | Nature OT Growth OS",
  description:
    "Schedule a short informational call about nature-based pediatric OT groups in Texas.",
};

export default function BookCallPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-moss">
          Scheduling
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl font-semibold text-forest">
          Book a Parent Call
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-bark/90">
          A short parent call helps us understand general needs, answer questions,
          and discuss whether a group, workshop, or individual support may be the
          best next step.
        </p>
      </div>

      <ComplianceBanner className="mx-auto mt-8 max-w-2xl">
        <p>
          This call is informational. It does not establish care, diagnose, or
          replace an in-person occupational therapy evaluation.
        </p>
      </ComplianceBanner>

      <div className="mt-10">
        <BookingEmbed />
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-[family-name:var(--font-fraunces)] text-xl text-forest">
            What to expect
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-bark/90">
            {[
              "About 10–15 minutes",
              "Space for parent questions",
              "Discussion of program fit—not pressure",
              "No diagnosis or evaluation during the call",
            ].map((x) => (
              <li key={x} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-moss" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-[family-name:var(--font-fraunces)] text-xl text-forest">
            Before you go
          </h2>
          <p className="mt-4 text-sm text-bark/90">
            Want context first? Explore the{" "}
            <Link href="/parent-guide" className="font-semibold text-moss underline">
              printable parent guide
            </Link>{" "}
            or the{" "}
            <Link href="/quiz" className="font-semibold text-moss underline">
              interactive guide
            </Link>
            —both are educational, not clinical assessments.
          </p>
          <Link
            href="/waitlist"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-sage/30 px-5 text-sm font-semibold text-forest hover:bg-cream/60"
          >
            Join the waitlist
          </Link>
        </Card>
      </div>
    </div>
  );
}
