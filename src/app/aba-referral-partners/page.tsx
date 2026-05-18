import type { Metadata } from "next";
import Link from "next/link";
import { ReferralPartnerForm } from "@/components/referral-partner-form";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "ABA Referral Partners | TreeTots DFW",
  description:
    "Nature-based pediatric OT groups and parent education in DFW designed to complement broader support teams.",
};

export default function AbaReferralPartnersPage() {
  return (
    <div>
      <section className="border-b border-sand/80 bg-gradient-to-b from-cream to-white/50 px-4 py-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-moss">
            Referral partners
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-forest sm:text-5xl">
            Nature-Based OT Resource for DFW ABA Providers and Families
          </h1>
          <p className="font-lead mx-auto mt-4 max-w-2xl text-lg text-bark/90">
            Programs are designed to complement a child’s broader support team by supporting regulation, motor confidence,
            social participation, outdoor confidence, and everyday functional skills through child-centered nature play.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <h2 className="font-display text-2xl text-forest">
              Complementary support
            </h2>
            <p className="mt-3 text-bark/90">
              TreeTots DFW is not a replacement for medical care, school services, or other therapies. We aim for clear role boundaries
              and operational communication.
            </p>
          </Card>
          <Card>
            <h2 className="font-display text-2xl text-forest">
              Referral-friendly materials
            </h2>
            <p className="mt-3 text-bark/90">
              We can provide printable referral sheets and family resources appropriate for front desks, newsletters, and community boards.
            </p>
          </Card>
        </div>

        <ComplianceBanner className="mt-10">
          <p>
            Please do not include patient identifiers, diagnoses, or clinical notes in marketing forms. We’ll follow up to coordinate next steps safely.
          </p>
        </ComplianceBanner>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <h2 className="font-display text-3xl text-forest">
              Request an ABA referral packet
            </h2>
            <p className="mt-4 text-bark/90">
              Share your organization info and preferred contact method. We’ll reply with printable summaries and a simple referral pathway.
            </p>
            <div className="mt-8 space-y-3 text-sm">
              <Link href="/provider-referral" className="block font-semibold text-moss underline">
                Provider referral form
              </Link>
              <Link href="/referral-partners" className="block font-semibold text-moss underline">
                General partners page
              </Link>
            </div>
          </div>
          <ReferralPartnerForm />
        </div>
      </section>
    </div>
  );
}

