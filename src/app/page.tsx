import type { Metadata } from "next";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  HOMEPAGE_QUERY,
  GROUPS_QUERY,
  TESTIMONIALS_QUERY,
  FAQ_QUERY,
  PROVIDER_SECTION_QUERY,
} from "@/sanity/lib/queries";
import { HeroLead, HeroSection } from "@/components/marketing/hero-section";
import { TrustBand } from "@/components/marketing/trust-band";
import { ConcernCards } from "@/components/marketing/concern-cards";
import { ServicesCatalogSection } from "@/components/marketing/services-catalog-section";
import { NatureOtFitSection } from "@/components/marketing/nature-ot-fit-section";
import { UpcomingGroups } from "@/components/marketing/upcoming-groups";
import { WhyChooseUs } from "@/components/marketing/why-choose-us";
import { NatureOTExplainer } from "@/components/marketing/nature-ot-explainer";
import { Testimonials } from "@/components/marketing/testimonials";
import { ProviderReferralSection } from "@/components/marketing/provider-referral-section";
import { LocalSEOSection } from "@/components/marketing/local-seo-section";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { faqItems as fallbackFaq } from "@/lib/homepage-data";

export const metadata: Metadata = {
  title:
    "Nature-Based Occupational Therapy Groups for Kids in Dallas-Fort Worth | TreeTots DFW",
  description:
    "Nature-based occupational therapy groups and services for children in Dallas-Fort Worth. Supporting sensory regulation, motor confidence, emotional regulation, social participation, and everyday skills through outdoor, play-based OT.",
};

export default async function HomePage() {
  const [
    { data: hp },
    { data: groups },
    { data: testimonials },
    { data: faq },
    { data: provider },
  ] = await Promise.all([
    sanityFetch<Record<string, unknown> | null>({ query: HOMEPAGE_QUERY, tags: ["homepage"] }),
    sanityFetch<Record<string, unknown>[] | null>({ query: GROUPS_QUERY, tags: ["groupOffering"] }),
    sanityFetch<Record<string, unknown>[] | null>({ query: TESTIMONIALS_QUERY, tags: ["testimonial"] }),
    sanityFetch<{ _id: string; question: string; answer: string }[] | null>({ query: FAQ_QUERY, tags: ["faqItem"] }),
    sanityFetch<Record<string, unknown> | null>({ query: PROVIDER_SECTION_QUERY, tags: ["providerSection"] }),
  ]);

  const faqForAccordion =
    faq && faq.length > 0
      ? faq.map((f) => ({ id: f._id, q: f.question, a: f.answer }))
      : fallbackFaq;

  const heroData = hp
    ? {
        headline: hp.heroHeadline as string,
        highlight: hp.heroHighlight as string,
        body: hp.heroBody as string,
        benefits: hp.heroBenefits as { iconName?: string; label?: string }[],
        trustText: hp.heroTrustText as string,
        trustCardItems: (hp.heroTrustCardItems as string[] | undefined)?.filter(
          (item) => item.toLowerCase() !== "child-led"
        ) ?? [],
        trustSubtext: hp.heroTrustSubtext as string,
      }
    : null;

  return (
    <>
      <HeroLead data={heroData} />
      <div className="pb-16">
        <HeroSection data={heroData} />
        <TrustBand
        data={hp ? {
          headline: hp.trustHeadline as string,
          body: hp.trustBody as string,
          stats: hp.trustStats as { iconName?: string; value?: string; label?: string }[],
        } : null}
        />
        <ConcernCards
        data={hp ? {
          headline: hp.concernsHeadline as string,
          items: hp.concernItems as { iconName?: string; label?: string }[],
          supportText: hp.concernsSupportText as string,
        } : null}
        />
        <ServicesCatalogSection />
        <NatureOtFitSection />

        <section className="bg-cream py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-moss">Enroll Today</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-forest sm:text-4xl">
              Find the Right Group for Your Child
            </h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <UpcomingGroups data={groups as { _id?: string; name?: string; schedule?: string; location?: string; status?: "enrolling" | "waitlist" | "full" }[] | null} />
            <WhyChooseUs />
          </div>
        </div>
      </section>

      <NatureOTExplainer
        data={hp ? {
          headline: hp.explainerHeadline as string,
          subtitle: hp.explainerSubtitle as string,
          body: hp.explainerBody as string,
          bullets: hp.explainerBullets as string[],
        } : null}
      />
      <Testimonials data={testimonials as { _id?: string; quote?: string; author?: string; location?: string; rating?: number }[] | null} />
      <ProviderReferralSection data={provider as { heading?: string; subheading?: string; body?: string; bullets?: string[] } | null} />
      <LocalSEOSection
        data={hp ? {
          headline: hp.localSeoHeadline as string,
          body: hp.localSeoBody as string,
          areas: hp.serviceAreas as string[],
        } : null}
      />

      <section className="bg-ivory py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-moss">Common Questions</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-forest sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
          <FaqAccordion items={faqForAccordion} />
        </div>
      </section>

      <LeadCaptureForm />
      </div>
    </>
  );
}
