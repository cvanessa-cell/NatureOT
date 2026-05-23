import { NextResponse } from "next/server";
import { z } from "zod";
import { appBaseUrl } from "@/lib/env";
import { isCheckoutSlug, isPriceIdForCheckoutSlug } from "@/lib/services-catalog";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const schema = z.object({
  priceId: z.string().min(1),
  service: z.string().min(1).max(200),
  serviceSlug: z.string().max(80).optional(),
  parent: z.string().min(1).max(200),
  email: z.string().email(),
  child: z.string().max(40).optional(),
  location: z.enum(["outdoor", "virtual", ""]),
});

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured on this site yet." },
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

  const { priceId, parent, email, child, location, service, serviceSlug } = parsed.data;
  if (!location) {
    return NextResponse.json({ error: "Please select a preferred format." }, { status: 400 });
  }

  const slug = serviceSlug?.trim() ?? "";
  if (slug) {
    if (!isCheckoutSlug(slug)) {
      return NextResponse.json({ error: "Unknown service." }, { status: 400 });
    }
    if (!isPriceIdForCheckoutSlug(slug, priceId)) {
      return NextResponse.json(
        { error: "Price does not match this program. Refresh the page and try again." },
        { status: 400 },
      );
    }
  }

  const base = appBaseUrl();

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: serviceSlug
        ? `${base}/checkout/cancel?service=${encodeURIComponent(serviceSlug)}`
        : `${base}/checkout/cancel`,
      metadata: {
        parent_name: parent.slice(0, 200),
        child_reference: child?.slice(0, 40) ?? "",
        preferred_location: location,
        service_name: service.slice(0, 200),
        checkout_slug: serviceSlug?.slice(0, 80) ?? "",
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not create checkout session." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: "Payment service unavailable. Please try again later." },
      { status: 500 },
    );
  }
}
