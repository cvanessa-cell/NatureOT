import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";

interface CtaProps {
  headline?: string | null;
  body?: string | null;
}

export function ConversionCTA({ data }: { data?: CtaProps | null }) {
  const headline = data?.headline || "Ready to See If We\u2019re a Good Fit?";
  const body =
    data?.body ||
    "Join the waitlist or book a free parent call. We\u2019ll answer your questions and help you find the right next step for your child.";

  return (
    <section className="relative overflow-hidden bg-forest py-20 text-cream lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(93,127,74,0.12),_transparent_55%)]" />
      <div className="pointer-events-none absolute right-10 top-10 text-cream/3">
        <Leaf className="size-64" aria-hidden />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center lg:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-moss/70">Take the First Step</p>
        <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-3xl font-semibold sm:text-4xl lg:text-5xl">
          {headline}
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-cream/75">{body}</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/waitlist" className="group inline-flex min-h-14 min-w-[14rem] items-center justify-center gap-2 rounded-full bg-cream px-8 text-lg font-semibold text-forest shadow-lg transition hover:bg-white hover:shadow-xl">
            Join the Waitlist
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <Link href="/book-call" className="inline-flex min-h-14 min-w-[14rem] items-center justify-center rounded-full border-2 border-cream/25 px-8 text-lg font-semibold text-cream transition hover:bg-cream/8">
            Book a Free Parent Call
          </Link>
        </div>
        <p className="mt-4 text-sm text-cream/50">Spots are limited — groups fill quickly each season.</p>
      </div>
    </section>
  );
}
