import type { Metadata } from "next";
import Link from "next/link";
import { getCheckoutOption, isCheckoutSlug } from "@/lib/services-catalog";

export const metadata: Metadata = {
  title: "Payment cancelled | TreeTots DFW",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ service?: string }>;
};

export default async function CheckoutCancelPage({ searchParams }: PageProps) {
  const { service: serviceParam } = await searchParams;
  const slug = serviceParam?.trim() ?? "";
  const option = slug && isCheckoutSlug(slug) ? getCheckoutOption(slug) : null;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gradient-to-b from-cream to-amber-50/40 px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold text-forest">Payment cancelled</h1>
      <p className="mt-4 max-w-md text-lg text-bark/90">
        No charge was made. You can return to checkout anytime or explore other options.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {option ? (
          <Link
            href={`/checkout/${option.slug}`}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-8 text-sm font-semibold text-cream shadow-sm transition hover:bg-forest/90"
          >
            Resume {option.name}
          </Link>
        ) : null}
        <Link
          href="/services"
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-forest/25 bg-white px-8 text-sm font-semibold text-forest transition hover:bg-cream/60"
        >
          View all services
        </Link>
        <Link
          href="/book-call"
          className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-moss/30 bg-white px-8 text-sm font-semibold text-moss transition hover:bg-cream/60"
        >
          Book a parent call
        </Link>
      </div>
      <p className="mt-6 max-w-md text-sm text-forest/65">
        Need help choosing a program?{" "}
        <Link href="/get-started" className="font-semibold text-moss underline underline-offset-4">
          Get in touch
        </Link>
        .
      </p>
    </div>
  );
}
