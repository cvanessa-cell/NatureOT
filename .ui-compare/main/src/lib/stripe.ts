import Stripe from "stripe";
import { getEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = getEnv().STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(getEnv().STRIPE_SECRET_KEY?.trim());
}
