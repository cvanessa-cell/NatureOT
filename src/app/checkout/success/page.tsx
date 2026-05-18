import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Booking confirmed | TreeTots DFW",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gradient-to-b from-cream to-sage/20 px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">Thank you!</h1>
      <p className="mt-4 max-w-md text-lg text-bark/90">
        Your spot is booked. We&apos;ll follow up with next steps soon.
      </p>
      <p className="mt-2 text-sm text-forest/65">
        Questions?{" "}
        <Link href="/get-started" className="font-semibold text-moss underline underline-offset-4">
          Get in touch
        </Link>
        .
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-8 text-sm font-semibold text-cream shadow-sm transition hover:bg-forest/90"
      >
        Back to home
      </Link>
    </div>
  );
}
