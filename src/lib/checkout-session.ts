import { getCheckoutOption, isCheckoutSlug } from "@/lib/services-catalog";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export type CheckoutSessionSummary = {
  serviceName: string;
  amountDisplay: string | null;
  checkoutSlug: string | null;
  email: string | null;
};

function formatUsd(cents: number | null | undefined): string | null {
  if (cents == null || cents < 0) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export async function getCheckoutSessionSummary(
  sessionId: string,
): Promise<CheckoutSessionSummary | null> {
  const id = sessionId.trim();
  if (!id.startsWith("cs_") || !isStripeConfigured()) return null;

  try {
    const session = await getStripe().checkout.sessions.retrieve(id);
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return null;
    }

    const slug = session.metadata?.checkout_slug?.trim() ?? "";
    const catalog =
      slug && isCheckoutSlug(slug) ? getCheckoutOption(slug) : null;
    const serviceName =
      session.metadata?.service_name?.trim() ||
      catalog?.name ||
      "Your program";

    return {
      serviceName,
      amountDisplay: formatUsd(session.amount_total),
      checkoutSlug: slug || null,
      email:
        session.customer_details?.email?.trim() ||
        session.customer_email?.trim() ||
        null,
    };
  } catch {
    return null;
  }
}
