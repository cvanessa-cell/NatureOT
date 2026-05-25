import "dotenv/config";

const e = process.env;
const set = (name) => Boolean(e[name]?.trim());

console.log(
  JSON.stringify(
    {
      STRIPE_SECRET_KEY: set("STRIPE_SECRET_KEY"),
      STRIPE_WEBHOOK_SECRET: set("STRIPE_WEBHOOK_SECRET"),
      NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_DROPIN: set(
        "NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_DROPIN",
      ),
      NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_6_PASS: set(
        "NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_6_PASS",
      ),
      NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_SINGLE: set(
        "NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_SINGLE",
      ),
      NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_6_WEEK: set(
        "NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_6_WEEK",
      ),
      NEXT_PUBLIC_STRIPE_PRICE_REFLEX_INTENSIVE: set(
        "NEXT_PUBLIC_STRIPE_PRICE_REFLEX_INTENSIVE",
      ),
    },
    null,
    2,
  ),
);
