import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ServiceCard } from "@/components/services/service-card";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { NatureOtFitSection } from "@/components/marketing/nature-ot-fit-section";
import { SERVICES_CATALOG } from "@/lib/services-catalog";
import { treetotsImageAlt, treetotsImages } from "@/lib/treetots-images";

export const metadata: Metadata = {
  title: "What We Offer | TreeTots DFW",
  description:
    "Nature play groups, therapist-led OT groups, and reflex integration intensives for families in Dallas–Fort Worth. Clear pricing and enrollment.",
};

export default function ServicesPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-sand/80 bg-gradient-to-b from-cream to-white/50">
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 lg:grid-cols-2 lg:gap-12 lg:py-16 lg:px-6">
          <div className="relative z-10 text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-moss">What We Offer</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-forest sm:text-5xl">
              Services for families
            </h1>
            <p className="font-lead mx-auto mt-4 max-w-xl text-lg text-bark/90 lg:mx-0">
              Choose a program, pay online when you&apos;re ready, or start with a parent call or
              waitlist. We only collect what we need to book your spot—no clinical records on these
              forms.
            </p>
            <p className="mx-auto mt-3 max-w-lg text-sm text-forest/60 lg:mx-0">
              Programs are designed to support participation, confidence, regulation, and
              connection.
            </p>
          </div>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-sand/70 shadow-lg shadow-forest/10 lg:max-w-none">
            <Image
              src={treetotsImages.otGroupHammockPlay}
              alt={treetotsImageAlt.otGroupHammockPlay}
              fill
              sizes="(min-width: 1024px) 50vw, 90vw"
              className="object-cover"
              style={{ objectPosition: "55% 45%" }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/15 to-transparent" />
          </div>
        </div>
      </section>

      <NatureOtFitSection />

      <section className="bg-cream py-12 lg:py-16">
        <div className="mx-auto max-w-5xl px-4 lg:px-6">
          <ComplianceBanner className="mb-8">
            <p>
              These pages are for enrollment and general inquiries only—not for urgent medical
              concerns or detailed clinical history.
            </p>
          </ComplianceBanner>

          <div className="grid gap-8">
            {SERVICES_CATALOG.map((service, index) => (
              <ServiceCard
                key={service.key}
                service={service}
                id={service.key === "reflex" ? "reflex-intensive" : undefined}
                imageOnRight={index % 2 === 1}
              />
            ))}
          </div>

          <div className="mt-10 space-y-4 rounded-[1.75rem] border border-sage/45 bg-white/80 px-5 py-6 text-center shadow-sm sm:px-8">
            <p className="text-sm leading-relaxed text-forest/70">
              Not sure which option fits?{" "}
              <Link
                href="/book-call"
                className="font-semibold text-moss underline underline-offset-4"
              >
                Book a free parent fit call
              </Link>
              {" "}or{" "}
              <Link
                href="/waitlist"
                className="font-semibold text-moss underline underline-offset-4"
              >
                join the waitlist
              </Link>
              .
            </p>
            <p className="text-xs text-forest/55">
              Participation recommendations may vary based on group fit and child needs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
