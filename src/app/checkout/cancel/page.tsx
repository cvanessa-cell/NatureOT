import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment cancelled | TreeTots DFW",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gradient-to-b from-cream to-amber-50/40 px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold text-forest">Payment cancelled</h1>
      <p className="mt-4 max-w-md text-lg text-bark/90">
        No worries—you can{" "}
        <Link href="/services" className="font-semibold text-moss underline underline-offset-4">
          choose a service
        </Link>{" "}
        anytime or{" "}
        <Link href="/get-started" className="font-semibold text-moss underline underline-offset-4">
          contact us
        </Link>{" "}
        for help.
      </p>
      <Link
        href="/services"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border-2 border-forest/25 bg-white px-8 text-sm font-semibold text-forest transition hover:bg-cream/60"
      >
        View services
      </Link>
    </div>
  );
}
