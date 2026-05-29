import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Leaf, Sparkles, Users } from "lucide-react";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeading } from "@/components/marketing/section-heading";
import { MembershipCheckoutPanel } from "@/components/membership/membership-checkout-panel";
import { MembershipFitCallLink } from "@/components/membership/membership-fit-call-link";
import {
  MEMBERSHIP_BENEFITS,
  MEMBERSHIP_DISCLAIMERS,
  MEMBERSHIP_FAQ,
  MEMBERSHIP_PLAN,
  MEMBERSHIP_WHO_ITS_FOR,
  getMembershipCheckoutOption,
  isMembershipPriceConfigured,
} from "@/lib/membership-catalog";

export const metadata: Metadata = {
  title: "TreeTots Family Membership | TreeTots DFW",
  description:
    "Ongoing support, priority access, caregiver resources, and nature-based connection for TreeTots DFW families between groups.",
};

const iconCards = [
  { icon: Leaf, title: "Nature-based ideas", copy: "Simple activities for home rhythms." },
  { icon: Users, title: "Community connection", copy: "Meetup opportunities when available." },
  { icon: Sparkles, title: "Early access", copy: "Hear about seasonal programs first." },
] as const;

export default function MembershipPage() {
  const monthly = getMembershipCheckoutOption("monthly");
  const annual = getMembershipCheckoutOption("annual");

  return (
    <div>
      <PageHero
        eyebrow="Family Membership"
        title="TreeTots Family Membership"
        description="Ongoing support, priority access, and nature-based resources for families who want to stay connected between groups."
        imageKey="naturePlayChildOnLog"
        imagePosition="50% 45%"
        actions={[
          { href: "#pricing", label: MEMBERSHIP_PLAN.ctaLabels.monthly },
          { href: "#pricing", label: MEMBERSHIP_PLAN.ctaLabels.annual },
          {
            href: "/book-call?service=membership",
            label: MEMBERSHIP_PLAN.ctaLabels.fitCall,
            variant: "secondary",
          },
        ]}
      />

      <section className="bg-cream py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {iconCards.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.5rem] border border-sage/40 bg-white/85 p-5 shadow-sm"
              >
                <item.icon className="size-6 text-moss" aria-hidden />
                <h2 className="mt-3 font-display text-xl font-semibold text-forest">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-forest/65">{item.copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-[2rem] border border-sand/70 bg-card/95 p-5 shadow-sm shadow-forest/10 sm:p-8">
            <SectionHeading
              eyebrow="Membership options"
              title="Choose monthly or annual support"
              description="Membership is designed as an add-on for families who want priority access, caregiver resources, and connection between programs."
            />
            <div className="mt-8">
              <MembershipCheckoutPanel
                plans={[
                  {
                    billingInterval: "monthly",
                    title: "Monthly",
                    priceLabel: monthly.priceLabel,
                    paymentsReady: isMembershipPriceConfigured("monthly"),
                  },
                  {
                    billingInterval: "annual",
                    title: "Annual",
                    priceLabel: annual.priceLabel,
                    savingsLabel: annual.savingsLabel,
                    paymentsReady: isMembershipPriceConfigured("annual"),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:px-6">
          <SectionHeading
            eyebrow="Benefits"
            title="Support that keeps families connected"
            description={MEMBERSHIP_PLAN.description}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {MEMBERSHIP_BENEFITS.map((benefit) => (
              <div
                key={benefit}
                className="flex gap-3 rounded-2xl border border-sage/35 bg-cream/70 p-4"
              >
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-moss" aria-hidden />
                <p className="text-sm leading-relaxed text-forest/75">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sage/20 py-12 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:px-6">
          <div>
            <SectionHeading
              eyebrow="Good fit"
              title="Who it's best for"
              description="Membership may be a good fit when your family wants to stay close to TreeTots without committing to a full group series yet."
            />
            <ul className="mt-6 space-y-3">
              {MEMBERSHIP_WHO_ITS_FOR.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-forest/75">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-moss" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <ComplianceBanner className="h-fit text-left">
            <h2 className="font-display text-2xl font-semibold text-forest">Important note</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-forest/75">
              {MEMBERSHIP_DISCLAIMERS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-moss/70" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ComplianceBanner>
        </div>
      </section>

      <section className="bg-cream py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-6">
          <SectionHeading
            eyebrow="Questions"
            title="Membership FAQ"
            description="Clear answers before you choose a monthly or annual plan."
            align="center"
          />
          <FaqAccordion items={[...MEMBERSHIP_FAQ]} className="mt-8" />
        </div>
      </section>

      <section className="bg-forest px-4 py-12 text-center text-cream lg:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-sage-light">
            Stay connected
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            Ready for ongoing TreeTots support?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-cream/75">
            Join monthly, join annually, or book a parent fit call if you want help deciding
            whether membership is a good fit.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="#pricing"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-cream px-7 text-sm font-semibold text-forest transition hover:bg-white"
            >
              Join Monthly
            </Link>
            <Link
              href="#pricing"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-sage px-7 text-sm font-semibold text-forest transition hover:bg-white"
            >
              Join Annually
            </Link>
            <MembershipFitCallLink className="border-cream/25 bg-transparent text-cream hover:bg-cream/10">
              Book Parent Fit Call
            </MembershipFitCallLink>
          </div>
        </div>
      </section>
    </div>
  );
}
