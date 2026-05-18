import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqAccordion, type FaqItem } from "@/components/marketing/faq-accordion";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { TEXAS_SEO_CITIES, getTexasCity } from "@/lib/texas-seo";

type Props = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return TEXAS_SEO_CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const row = getTexasCity(city);
  if (!row) return { title: "City page | TreeTots DFW" };
  return {
    title: `Nature-Based OT Groups for Kids in ${row.displayName}, TX | TreeTots DFW`,
    description: `Educational overview of TreeTots DFW outdoor pediatric occupational therapy groups serving families near ${row.displayName}.`,
  };
}

const faqForCity = (name: string): FaqItem[] => [
  {
    id: "1",
    q: `Do you serve families only in ${name}?`,
    a: "We use city pages to describe typical service areas; exact availability changes by cohort and season. The waitlist and parent call help confirm fit.",
  },
  {
    id: "2",
    q: "Is this therapy or enrichment?",
    a: "Groups are structured therapeutic activities led with pediatric OT expertise when enrolled through the practice. This webpage remains educational until you complete intake.",
  },
  {
    id: "3",
    q: "Does my child need a diagnosis?",
    a: "Not for browsing this site. Clinical appropriateness is determined through your intake process—not by reading a webpage.",
  },
];

export default async function TexasCityPage({ params }: Props) {
  const { city } = await params;
  const row = getTexasCity(city);
  if (!row) notFound();

  return (
    <div>
      <PageHero
        eyebrow={`${row.displayName}, Texas`}
        title={`Nature-based occupational therapy groups for kids near ${row.displayName}`}
        description="Small-group outdoor occupational therapy can support regulation, motor confidence, peer participation, and functional skills through guided nature play when the fit is right for your family."
        imageKey="groupTrailHero"
        imagePosition="50% 48%"
        actions={[
          { href: "/waitlist", label: "Join the waitlist" },
          { href: "/book-call", label: "Book a parent call", variant: "secondary" },
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-14">
      <section className="rounded-[1.75rem] border border-sand bg-card/95 p-6">
        <h2 className="font-display text-2xl text-forest">
          Nearby areas families often mention
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {row.nearby.map((n) => (
            <li
              key={n}
              className="rounded-full border border-sand bg-cream/60 px-3 py-1 text-sm text-forest"
            >
              {n}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-bark/80">
          TreeTots DFW uses local pages to help families understand service areas, seasonal cohort
          planning, and whether a nearby parent call or waitlist is the right next step.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-bark/90">
        <h2 className="font-display text-2xl text-forest">
          Program options
        </h2>
        <p>
          After-school regulation groups, homeschool daytime cohorts, seasonal camps, and parent
          workshops may be available depending on staffing and location. Outcomes vary by child.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-bark/90">
        <h2 className="font-display text-2xl text-forest">
          What families often notice at home
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Benefits from movement-rich days with supportive pacing</li>
          <li>Works on coordination or confidence with guidance—not pressure</li>
          <li>Needs help with transitions or big emotions during active play</li>
        </ul>
      </section>

      <ComplianceBanner className="mt-10">
        <p>
          This information is educational and does not determine eligibility or replace an individualized
          occupational therapy evaluation. Group fit depends on age, developmental needs, safety, schedule,
          and social fit.
        </p>
      </ComplianceBanner>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/waitlist"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-8 font-medium text-cream"
        >
          Join the Waitlist
        </Link>
        <Link
          href="/book-call"
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-sage/40 px-8 font-medium text-forest"
        >
          Book a Parent Call
        </Link>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl text-forest">
          FAQ
        </h2>
        <FaqAccordion className="mt-6" items={faqForCity(row.displayName)} />
      </section>
      </div>
    </div>
  );
}
