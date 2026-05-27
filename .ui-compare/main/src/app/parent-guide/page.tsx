import type { Metadata } from "next";
import Link from "next/link";
import { ParentGuideLeadForm } from "@/components/parent-guide-lead-form";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Free Parent Guide | TreeTots DFW",
  description:
    "Download a practical TreeTots DFW guide with outdoor sensory activity ideas for Dallas-Fort Worth families.",
};

export default function ParentGuidePage() {
  return (
    <div>
      <PageHero
        eyebrow="For Parents"
        title="Download the free outdoor sensory activity guide"
        description="Practical starting ideas families can try outdoors, with pacing notes and safety reminders that support curiosity without replacing individualized OT care."
        imageKey="parentGuideOutdoor"
        imagePosition="60% 40%"
        actions={[
          { href: "#parent-guide-form", label: "Get the guide" },
          { href: "/quiz", label: "Try the interactive guide", variant: "secondary" },
        ]}
      />

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <div>
          <ul className="mt-8 space-y-3 text-bark/90">
            <li>Movement-forward prompts rooted in everyday outdoor settings</li>
            <li>Gentle regulation cues parents can adapt</li>
            <li>Clear language: educational—not a screening tool</li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/quiz"
              className="inline-flex min-h-11 items-center rounded-full border border-sage/35 px-5 text-sm font-semibold text-forest hover:bg-cream/70"
            >
              Prefer the interactive guide instead?
            </Link>
          </div>
          <ComplianceBanner className="mt-10">
            <p>
              You may unsubscribe from marketing emails anytime. This download does not create a clinical chart entry by itself.
            </p>
          </ComplianceBanner>
        </div>
        <div id="parent-guide-form">
          <ParentGuideLeadForm />
        </div>
      </div>
    </div>
  );
}
