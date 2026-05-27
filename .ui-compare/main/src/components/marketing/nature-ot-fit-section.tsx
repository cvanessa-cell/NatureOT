import Link from "next/link";
import {
  NATURE_OT_FIT_CLOSING,
  NATURE_OT_FIT_SIGNALS,
} from "@/lib/services-catalog";

export function NatureOtFitSection() {
  return (
    <section className="border-y border-sand/70 bg-gradient-to-b from-white/80 to-cream py-14 lg:py-20">
      <div className="mx-auto max-w-3xl px-4 lg:px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-moss">
          For Parents
        </p>
        <h2 className="mt-3 text-center font-display text-3xl font-semibold text-forest sm:text-4xl">
          Could Nature-Based OT Help Your Child?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-bark/90">
          Many families come to TreeTots feeling uncertain, overwhelmed, or simply looking for a
          better way to support their child&apos;s growth. Your child may benefit from nature-based
          occupational therapy support if you&apos;ve noticed:
        </p>
        <ul className="mx-auto mt-8 max-w-xl space-y-3 text-sm leading-relaxed text-forest/80 sm:text-base">
          {NATURE_OT_FIT_SIGNALS.map((signal) => (
            <li key={signal} className="flex gap-3">
              <span className="mt-2 size-2 shrink-0 rounded-full bg-moss/80" aria-hidden />
              <span>{signal}</span>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-8 max-w-2xl text-center text-base leading-relaxed text-bark/90">
          {NATURE_OT_FIT_CLOSING}
        </p>
        <p className="mt-6 text-center text-sm text-forest/60">
          Programs are designed to support participation, confidence, regulation, and connection.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/book-call"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-8 text-sm font-semibold text-cream shadow-sm transition hover:bg-forest/90"
          >
            Book a parent fit call
          </Link>
          <Link
            href="/services"
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-forest/25 bg-white px-8 text-sm font-semibold text-forest transition hover:bg-cream/60"
          >
            Compare services &amp; pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
