import type { Metadata } from "next";
import Link from "next/link";
import { ParentGuideLeadForm } from "@/components/parent-guide-lead-form";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";

export const metadata: Metadata = {
  title: "Free Parent Guide | Nature OT Growth OS",
  description:
    "Download a practical starting guide with outdoor sensory activity ideas for Texas families—educational only.",
};

export default function ParentGuidePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-sage">
            Lead magnet
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl font-semibold leading-tight text-forest sm:text-5xl">
            Download the Free Parent Guide: 10 Outdoor Sensory Activities for Texas Kids
          </h1>
          <p className="mt-6 text-lg text-bark/90">
            Practical starting ideas families can try outdoors—with pacing notes and safety reminders.
            This resource supports curiosity and routine-building; it does not replace individualized OT care.
          </p>
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
        <div>
          <ParentGuideLeadForm />
        </div>
      </div>
    </div>
  );
}
