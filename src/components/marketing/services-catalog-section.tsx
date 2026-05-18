import Link from "next/link";
import { ServiceCard } from "@/components/services/service-card";
import { SERVICES_CATALOG } from "@/lib/services-catalog";

export function ServicesCatalogSection() {
  return (
    <section className="bg-ivory py-16 lg:py-24" aria-labelledby="enrollment-services-heading">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-moss">Programs</p>
          <h2
            id="enrollment-services-heading"
            className="mt-3 font-display text-3xl font-semibold text-forest sm:text-4xl"
          >
            Choose the right fit for your family
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-forest/65">
            Compare nature play, therapist-led OT groups, and at-home reflex support. Start with
            a gentle parent call or choose a program when you&apos;re ready.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-1">
          {SERVICES_CATALOG.map((service, index) => (
            <ServiceCard
              key={service.key}
              service={service}
              compact
              imageOnRight={index % 2 === 1}
            />
          ))}
        </div>

        <div className="mt-10 rounded-[1.75rem] border border-sage/45 bg-white/80 px-5 py-5 text-center shadow-sm sm:px-8">
          <p className="text-sm leading-relaxed text-forest/70">
            Not sure which option fits?{" "}
            <Link
              href="/book-call"
              className="font-semibold text-moss underline underline-offset-4"
            >
              Book a parent fit call
            </Link>
            .{" "}
            <Link
              href="/services"
              className="font-semibold text-moss underline underline-offset-4"
            >
              View full service details
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
