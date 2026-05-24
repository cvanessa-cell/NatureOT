import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/services/checkout-form";
import { Card } from "@/components/ui/card";
import { getCheckoutOption, isCheckoutSlug } from "@/lib/services-catalog";
import { checkoutSavingsHint, pricePerSessionLabel } from "@/lib/services-pricing";
import { isStripeConfigured } from "@/lib/stripe";

type PageProps = {
  params: Promise<{ service: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service } = await params;
  const option = getCheckoutOption(service);
  return {
    title: option ? `Checkout — ${option.name}` : "Checkout | TreeTots DFW",
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({ params }: PageProps) {
  const { service } = await params;
  if (!isCheckoutSlug(service)) notFound();

  const option = getCheckoutOption(service);
  if (!option) notFound();

  const paymentsReady = isStripeConfigured() && Boolean(option.priceId);
  const perSession = pricePerSessionLabel({
    label: option.name,
    amount: option.amount,
    checkoutSlug: option.slug,
  });
  const savings = checkoutSavingsHint(option.slug);

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-cream to-white/60 px-4 py-12">
      <div className="mx-auto w-full max-w-xl">
        <p className="text-center text-sm font-medium text-moss">
          <Link href="/services" className="underline underline-offset-4">
            ← All services
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-forest/55">
          Step 2 of 3 · Review details, then pay securely with Stripe
        </p>
        <Card className="mt-6 p-6 sm:p-8">
          <h1 className="font-display text-2xl font-semibold text-forest">{option.name}</h1>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <p className="text-2xl font-semibold text-moss">${option.amount}</p>
            {perSession && (
              <p className="text-sm font-medium text-forest/60">{perSession}</p>
            )}
          </div>
          <p className="mt-1 text-xs text-forest/55">One-time payment · processed securely by Stripe</p>
          {savings && (
            <p className="mt-2 inline-flex rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
              {savings}
            </p>
          )}
          <p className="mt-3 text-sm leading-relaxed text-bark/90">{option.description}</p>

          <div className="mt-5 rounded-2xl border border-sage/35 bg-cream/50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-forest/55">
              What&apos;s included
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-forest/75">
              {option.included.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-moss/70" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-forest/55">
            You&apos;ll complete payment securely with Stripe. We only ask for minimum-necessary
            booking details—no diagnosis or clinical records on this form.
          </p>

          <div className="mt-6 border-t border-sand/60 pt-6">
            <CheckoutForm
              option={option}
              paymentsReady={paymentsReady}
              stripeConfigured={isStripeConfigured()}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
