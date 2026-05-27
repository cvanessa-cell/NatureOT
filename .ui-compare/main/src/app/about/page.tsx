import type { Metadata } from "next";
import Link from "next/link";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "About TreeTots DFW | Nature-Based Pediatric OT",
  description:
    "Learn how TreeTots DFW supports children and families through therapist-led, nature-based pediatric occupational therapy groups and parent education.",
};

export default function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="About TreeTots DFW"
        title="Outdoor OT support with warmth, structure, and clinical intention"
        description="TreeTots DFW helps families explore nature-based pediatric occupational therapy groups, parent education, and practical next steps across Dallas-Fort Worth."
        imageKey="providerSection"
        imagePosition="50% 45%"
        actions={[
          { href: "/waitlist", label: "Join the waitlist" },
          { href: "/book-call", label: "Book a parent call", variant: "secondary" },
        ]}
      />

      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="space-y-4 text-bark/90">
          <p>
            We focus on sensory regulation, motor confidence, emotional regulation,
            social participation, and everyday functional skills because those are
            the areas families most often want help understanding and supporting.
          </p>
          <p>
            Outdoor environments naturally invite movement, peer moments, flexible
            problem-solving, and confidence-building. TreeTots DFW brings pediatric
            OT reasoning into those real-world experiences while keeping parent
            communication clear and approachable.
          </p>
          <p>
            This website is educational. It is not a substitute for medical advice
            or an individualized occupational therapy evaluation. Group fit is
            determined using age, developmental needs, safety, schedule, and social
            fit, not a web quiz alone.
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
      </div>
    </div>
  );
}
