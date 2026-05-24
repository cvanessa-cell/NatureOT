import type { Metadata } from "next";
import Link from "next/link";
import { getCheckoutSessionSummary } from "@/lib/checkout-session";
import { checkoutSuccessNextSteps } from "@/lib/checkout-next-steps";
import {
  isCheckoutSlug,
  servicesPageAnchorForCheckoutSlug,
} from "@/lib/services-catalog";

export const metadata: Metadata = {
  title: "Booking confirmed | TreeTots DFW",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;
  const summary = sessionId ? await getCheckoutSessionSummary(sessionId) : null;
  const servicesHref =
    summary?.checkoutSlug && isCheckoutSlug(summary.checkoutSlug)
      ? `/services#${servicesPageAnchorForCheckoutSlug(summary.checkoutSlug)}`
      : "/services";
  const nextSteps = checkoutSuccessNextSteps(summary?.checkoutSlug ?? null);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gradient-to-b from-cream to-sage/20 px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-moss">Payment received</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest sm:text-4xl">
        Thank you!
      </h1>
      {summary ? (
        <>
          <p className="mt-4 max-w-md text-lg text-bark/90">
            Your enrollment for <span className="font-semibold text-forest">{summary.serviceName}</span>
            {summary.amountDisplay ? (
              <>
                {" "}
                (<span className="font-semibold text-moss">{summary.amountDisplay}</span>)
              </>
            ) : null}{" "}
            is confirmed.
          </p>
          {summary.email && (
            <p className="mt-2 text-sm text-forest/65">
              We&apos;ll email next steps to{" "}
              <span className="font-medium text-forest">{summary.email}</span>.
            </p>
          )}
        </>
      ) : (
        <p className="mt-4 max-w-md text-lg text-bark/90">
          Your spot is booked. We&apos;ll follow up with next steps soon.
        </p>
      )}
      <ul className="mt-6 max-w-md space-y-2 text-left text-sm text-forest/75">
        {nextSteps.map((step) => (
          <li key={step} className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-moss/70" aria-hidden />
            <span>{step}</span>
          </li>
        ))}
        <li className="flex gap-2">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-moss/70" aria-hidden />
          <span>
            Questions before your first session?{" "}
            <Link href="/book-call" className="font-semibold text-moss underline underline-offset-4">
              Book a parent fit call
            </Link>
            .
          </span>
        </li>
      </ul>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-8 text-sm font-semibold text-cream shadow-sm transition hover:bg-forest/90"
        >
          Back to home
        </Link>
        <Link
          href={servicesHref}
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-forest/25 bg-white px-8 text-sm font-semibold text-forest transition hover:bg-cream/60"
        >
          {summary?.checkoutSlug ? "Back to this program" : "View all services"}
        </Link>
      </div>
    </div>
  );
}
