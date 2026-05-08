import type { Metadata } from "next";
import Link from "next/link";
import { ReferralPartnerForm } from "@/components/referral-partner-form";
import { Card } from "@/components/ui/card";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { Building2, HeartHandshake, School, Trees } from "lucide-react";

export const metadata: Metadata = {
  title: "Referral Partners | Nature OT Growth OS",
  description:
    "Partner with a nature-based pediatric OT program—schools, pediatricians, therapists, and community organizations.",
};

const partners = [
  "Pediatricians",
  "Schools",
  "Preschools",
  "Homeschool groups",
  "SLPs",
  "PTs",
  "Counselors",
  "Nature schools",
  "Parent communities",
  "Libraries",
  "Parks and recreation programs",
];

export default function ReferralPartnersPage() {
  return (
    <div>
      <section className="border-b border-sand/80 bg-gradient-to-b from-cream to-white/50 px-4 py-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-sage">
            Partnerships
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl font-semibold text-forest sm:text-5xl">
            Partner With a Nature-Based Pediatric OT Program
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-bark/90">
            We collaborate with community professionals who want structured outdoor OT groups,
            workshops, and parent education that supports functional participation through movement,
            sensory-rich play, and guided peer interaction.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-sky/20 bg-gradient-to-br from-sky/10 to-cream/40">
            <Building2 className="size-10 text-sky" aria-hidden />
            <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-2xl text-forest">
              Referral-friendly explanation
            </h2>
            <p className="mt-3 text-bark/90">
              Outbound materials focus on service descriptions and scheduling pathways—not confidential student or patient records.
            </p>
          </Card>
          <Card>
            <Trees className="size-10 text-sage" aria-hidden />
            <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-2xl text-forest">
              Outdoor strengths
            </h2>
            <p className="mt-3 text-bark/90">
              We emphasize regulation, motor confidence, social participation, and practical skills practiced outside—without claiming universal outcomes.
            </p>
          </Card>
          <Card>
            <School className="size-10 text-terracotta" aria-hidden />
            <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-2xl text-forest">
              Schools & homeschool groups
            </h2>
            <p className="mt-3 text-bark/90">
              We respect IEP boundaries and communicate clearly about what group OT can and cannot replace.
            </p>
          </Card>
          <Card>
            <HeartHandshake className="size-10 text-moss" aria-hidden />
            <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-2xl text-forest">
              Therapists & counselors
            </h2>
            <p className="mt-3 text-bark/90">
              Interdisciplinary respect matters. We share operational updates appropriate for coordination—not mini charts over email.
            </p>
          </Card>
        </div>
      </section>

      <section className="border-y border-sand/80 bg-white/60 py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
            Who we partner with
          </h2>
          <ul className="mx-auto mt-8 flex flex-wrap justify-center gap-2">
            {partners.map((p) => (
              <li
                key={p}
                className="rounded-full border border-sand bg-card/95 px-4 py-2 text-sm font-medium text-forest shadow-sm"
              >
                {p}
              </li>
            ))}
          </ul>
          <ComplianceBanner className="mx-auto mt-10 max-w-2xl text-left">
            <p>
              Partnership inquiries are operational. Protect patient/student privacy—do not send identifiers or records through this marketing form.
            </p>
          </ComplianceBanner>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl text-forest">
              Request a referral packet
            </h2>
            <p className="mt-4 text-bark/90">
              Tell us about your organization and how families find you. We&rsquo;ll follow up with printable summaries appropriate for front-desk or community boards.
            </p>
            <Link href="/faq" className="mt-8 inline-block text-sm font-semibold text-sage underline">
              Read FAQs
            </Link>
          </div>
          <ReferralPartnerForm />
        </div>
      </section>
    </div>
  );
}
