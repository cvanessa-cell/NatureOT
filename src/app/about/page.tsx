import type { Metadata } from "next";
import Link from "next/link";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";

export const metadata: Metadata = {
  title: "About | Nature OT Growth OS",
  description:
    "How we talk about nature-based pediatric occupational therapy groups—honest, parent-friendly, and education-first.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <p className="text-sm font-medium uppercase tracking-wide text-moss">About</p>
      <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl font-semibold text-forest">
        A growth platform built for real-world outdoor OT
      </h1>
      <p className="mt-6 text-lg text-bark/90">
        Nature OT Growth OS exists to help families discover whether small-group,
        nature-based pediatric occupational therapy may be a supportive next step—
        without overpromising outcomes or replacing individualized evaluation when
        that is clinically indicated.
      </p>
      <div className="mt-8 space-y-4 text-bark/90">
        <p>
          We emphasize sensory regulation, motor confidence, emotional regulation,
          social participation, and functional skills practiced outdoors because
          those are the strengths families most often name—and because outdoor
          environments naturally invite movement, peer moments, and flexible
          problem-solving with skilled adult guidance.
        </p>
        <p>
          This website is educational. It is not a substitute for medical advice or
          an individualized occupational therapy evaluation. Group fit is
          determined using age, developmental needs, safety, schedule, and social
          fit—not a web quiz alone.
        </p>
      </div>
      <ComplianceBanner className="mt-10">
        <p>
          If you need urgent medical attention, contact your physician or local
          emergency services.{" "}
          <Link href="/faq" className="font-medium underline">
            Read FAQs
          </Link>{" "}
          for common questions about nature-based OT groups.
        </p>
      </ComplianceBanner>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/waitlist"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-6 font-medium text-cream"
        >
          Join the waitlist
        </Link>
        <Link
          href="/book-call"
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-sage/40 px-6 font-medium text-forest"
        >
          Book a parent call
        </Link>
      </div>
    </div>
  );
}
