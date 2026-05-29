import { NextResponse } from "next/server";
import { z } from "zod";
import { appBaseUrl } from "@/lib/env";
import {
  getMembershipCheckoutOption,
  isMembershipBillingInterval,
} from "@/lib/membership-catalog";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  billingInterval: z.enum(["monthly", "annual"]),
  parent: z.string().min(1).max(200),
  email: z.string().email(),
  source: z.string().min(1).max(80).optional(),
});

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Membership payments are not configured on this site yet." },
      { status: 503 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { billingInterval, parent, email } = parsed.data;
  const source = parsed.data.source?.trim() || "website";
  if (!isMembershipBillingInterval(billingInterval)) {
    return NextResponse.json({ error: "Unknown membership option." }, { status: 400 });
  }

  const option = getMembershipCheckoutOption(billingInterval);
  if (!option.priceId) {
    return NextResponse.json(
      { error: "This membership option is not available for checkout yet." },
      { status: 503 },
    );
  }

  const base = appBaseUrl();

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: option.priceId, quantity: 1 }],
      customer_email: email,
      success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=membership`,
      cancel_url: `${base}/checkout/cancel?type=membership&interval=${encodeURIComponent(
        billingInterval,
      )}`,
      metadata: {
        plan_type: "family_membership",
        billing_interval: billingInterval,
        source: source.slice(0, 80),
        parent_name: parent.slice(0, 200),
        service_name: option.name.slice(0, 200),
        checkout_slug: option.checkoutSlug.slice(0, 80),
      },
    });

    await writeAuditLog({
      action: "stripe.membership_checkout.started",
      resourceType: "checkout_session",
      resourceId: session.id,
      details: {
        plan_type: "family_membership",
        billing_interval: billingInterval,
        checkout_slug: option.checkoutSlug,
        customer_email: email,
        source,
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not create checkout session." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[membership-checkout]", err);
    return NextResponse.json(
      { error: "Membership checkout is unavailable. Please try again later." },
      { status: 500 },
    );
  }
}
