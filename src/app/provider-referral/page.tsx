import type { Metadata } from "next";
import Link from "next/link";
import { ReferralPartnerForm } from "@/components/referral-partner-form";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";

export const metadata: Metadata = {
  title: "Provider Referral | TreeTotsNatureOT",
  description:
    "Referral-friendly information for DFW providers and community partners. Operational only—no PHI in marketing forms.",
};

export default function ProviderReferralPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-moss">Providers</p>
          <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-4xl font-semibold text-forest">
            Refer a family to TreeTotsNatureOT
          </h1>
          <p className="mt-4 text-bark/90">
            TreeTotsNatureOT offers nature-based pediatric occupational therapy groups and parent education in the Fort Worth / Dallas area.
            Outreach and referrals here are operational and minimum-necessary.
          </p>
          <ComplianceBanner className="mt-8">
            <p>
              Please do not include identifiers, diagnoses, or clinical records in this form. We will follow up with a safe next step.
            </p>
          </ComplianceBanner>
          <div className="mt-8 space-y-3 text-sm">
            <Link href="/book-call" className="block font-semibold text-moss underline">
              Prefer a quick provider call? Book a call
            </Link>
            <Link href="/aba-referral-partners" className="block font-semibold text-moss underline">
              ABA partner packet
            </Link>
            <Link href="/referral-partners" className="block font-semibold text-moss underline">
              General partner page
            </Link>
          </div>
        </div>
        <div>
          <ReferralPartnerForm />
        </div>
      </div>
    </div>
  );
}

