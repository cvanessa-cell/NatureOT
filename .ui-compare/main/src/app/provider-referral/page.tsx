import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileText,
  ShieldCheck,
  Trees,
  Users,
} from "lucide-react";
import { ReferralPartnerForm } from "@/components/referral-partner-form";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Provider Referral | TreeTots DFW",
  description:
    "Referral-friendly information for DFW providers and community partners. Operational only; no PHI in marketing forms.",
};

export default function ProviderReferralPage() {
  return (
    <div className="bg-gradient-to-b from-cream via-ivory to-white/70">
      <section className="border-b border-sand/80 px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-moss">Providers</p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-forest sm:text-5xl">
                Refer a family with a clear, privacy-aware next step
              </h1>
              <p className="font-lead mt-5 max-w-2xl text-lg leading-relaxed text-bark/90">
                TreeTots DFW offers therapist-led, goal-directed, nature-based pediatric OT
                groups and parent education for families in the Dallas-Fort Worth area. This page
                is designed for minimum-necessary outreach, not clinical record sharing.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#provider-form"
                  className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold text-white shadow-md shadow-terracotta/20 transition hover:bg-terracotta/90 hover:shadow-lg"
                >
                  Start Referral Request
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
                </Link>
                <Link
                  href="/referral-partners#request-packet"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-forest/20 bg-white/80 px-6 text-sm font-semibold text-forest transition hover:border-forest/35 hover:bg-white"
                >
                  <FileText className="size-4" aria-hidden />
                  Request Partner Packet
                </Link>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <Card className="rounded-[1.5rem] border-sky/20 bg-white/85 p-5">
                  <Building2 className="size-8 text-sky" aria-hidden />
                  <h2 className="mt-3 font-display text-xl text-forest">Built for referral partners</h2>
                  <p className="mt-2 text-sm leading-relaxed text-bark/88">
                    Helpful for pediatricians, schools, counselors, therapists, and community organizations.
                  </p>
                </Card>
                <Card className="rounded-[1.5rem] border-sage/40 bg-white/85 p-5">
                  <Trees className="size-8 text-moss" aria-hidden />
                  <h2 className="mt-3 font-display text-xl text-forest">Clear service framing</h2>
                  <p className="mt-2 text-sm leading-relaxed text-bark/88">
                    Outdoor OT is positioned as therapist-led, goal-directed support, not generic outdoor play.
                  </p>
                </Card>
                <Card className="rounded-[1.5rem] border-terracotta/20 bg-white/85 p-5">
                  <ShieldCheck className="size-8 text-terracotta" aria-hidden />
                  <h2 className="mt-3 font-display text-xl text-forest">Privacy first</h2>
                  <p className="mt-2 text-sm leading-relaxed text-bark/88">
                    Marketing forms stay minimum-necessary and avoid child identifiers, diagnoses, and records.
                  </p>
                </Card>
              </div>
            </div>

            <div className="rounded-[2rem] border border-sage/45 bg-white/88 p-6 shadow-lg shadow-forest/5">
              <p className="text-sm font-semibold uppercase tracking-wide text-moss">How referrals work</p>
              <ol className="mt-5 space-y-4">
                <li className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage/35 text-sm font-semibold text-forest">1</span>
                  <div>
                    <p className="text-sm font-semibold text-forest">Share organization and contact details</p>
                    <p className="mt-1 text-sm leading-relaxed text-bark/88">
                      Use the form below for operational outreach only.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage/35 text-sm font-semibold text-forest">2</span>
                  <div>
                    <p className="text-sm font-semibold text-forest">We follow up with the right materials</p>
                    <p className="mt-1 text-sm leading-relaxed text-bark/88">
                      That may include a referral packet, family-facing summary, or a short provider call.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage/35 text-sm font-semibold text-forest">3</span>
                  <div>
                    <p className="text-sm font-semibold text-forest">Families receive a gentle next step</p>
                    <p className="mt-1 text-sm leading-relaxed text-bark/88">
                      We guide fit conversations without using this page for clinical intake.
                    </p>
                  </div>
                </li>
              </ol>

              <ComplianceBanner className="mt-6">
                <p>
                  Please do not include child names, diagnoses, evaluations, or chart notes here. We will follow up safely.
                </p>
              </ComplianceBanner>

              <div className="mt-6 rounded-[1.5rem] border border-sand/80 bg-cream/65 p-4">
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 size-5 shrink-0 text-moss" aria-hidden />
                  <p className="text-sm leading-relaxed text-bark/90">
                    Need a faster conversation for a family, school, or clinic relationship?
                    <Link href="/book-call" className="ml-1 font-semibold text-moss underline underline-offset-4">
                      Book a provider call
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <h2 className="font-display text-3xl text-forest">Send a provider inquiry</h2>
            <p className="mt-4 text-bark/90">
              Share the minimum information needed for our team to route your request and send the
              appropriate next step for your practice, school, or community organization.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <Link href="/aba-referral-partners" className="block font-semibold text-moss underline">
                ABA-specific partner page
              </Link>
              <Link href="/referral-partners" className="block font-semibold text-moss underline">
                General partnerships overview
              </Link>
            </div>
          </div>
          <div id="provider-form">
            <ReferralPartnerForm />
          </div>
        </div>
      </section>
    </div>
  );
}
