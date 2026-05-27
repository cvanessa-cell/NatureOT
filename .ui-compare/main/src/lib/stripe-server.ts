/**
 * Stripe — add `npm i stripe` and implement payment intents or billing portal.
 * Use STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET from the host environment only.
 */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
