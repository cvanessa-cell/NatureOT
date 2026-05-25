import type { TreetotsImageKey } from "@/lib/treetots-images";

export type ServiceBadge =
  | "Play-Based"
  | "Therapist-Led"
  | "Virtual Intensive"
  | "Best for Social Play"
  | "Best for Regulation Support"
  | "At-Home Program"
  | "Outdoor Play";

export type CheckoutSlug =
  | "nature-play-dropin"
  | "nature-play-pass"
  | "ot-group"
  | "ot-group-series"
  | "reflex";

export type ServiceCta = {
  label: string;
  href: string;
  variant?: "primary" | "outline";
};

export type ServicePrice = {
  label: string;
  amount: number;
  checkoutSlug?: CheckoutSlug;
};

export type CatalogService = {
  key: string;
  name: string;
  description: string;
  details: string[];
  badges: ServiceBadge[];
  prices: ServicePrice[];
  ctas: ServiceCta[];
  imageKey?: TreetotsImageKey;
  imagePosition?: string;
};

const PRICE_ENV: Record<CheckoutSlug, string> = {
  "nature-play-dropin": "NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_DROPIN",
  "nature-play-pass": "NEXT_PUBLIC_STRIPE_PRICE_NATURE_PLAY_6_PASS",
  "ot-group": "NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_SINGLE",
  "ot-group-series": "NEXT_PUBLIC_STRIPE_PRICE_OT_GROUP_6_WEEK",
  reflex: "NEXT_PUBLIC_STRIPE_PRICE_REFLEX_INTENSIVE",
};

export const SERVICES_CATALOG: CatalogService[] = [
  {
    key: "nature-play",
    name: "Nature Play Groups",
    imageKey: "naturePlayChildOnLog",
    imagePosition: "50% 45%",
    description:
      "Nature Play Groups are child-led outdoor play sessions designed to support movement, imagination, peer connection, and confidence in a relaxed natural setting. These groups are a great fit for families looking for purposeful outdoor play, social connection, and movement without the formality of therapy. Children explore, create, climb, build, pretend, and connect with peers while developing confidence, curiosity, and independence.",
    details: [
      "Best for families seeking outdoor play, social connection, and movement",
      "Child-led, play-based, and low-pressure",
      "Supports creativity, confidence, peer interaction, and exploration",
      "Not a substitute for individualized occupational therapy",
    ],
    badges: ["Play-Based", "Best for Social Play", "Outdoor Play"],
    prices: [
      { label: "Drop-in session", amount: 35, checkoutSlug: "nature-play-dropin" },
      { label: "6-session pass", amount: 180, checkoutSlug: "nature-play-pass" },
    ],
    ctas: [
      { label: "Choose Drop-In", href: "/checkout/nature-play-dropin", variant: "primary" },
      { label: "Buy 6-Session Pass", href: "/checkout/nature-play-pass", variant: "primary" },
      {
        label: "Ask If This Is a Good Fit",
        href: "/get-started?service=nature-play",
        variant: "outline",
      },
    ],
  },
  {
    key: "ot-group",
    name: "Nature-Based OT Groups",
    imageKey: "otGroupHammockPlay",
    imagePosition: "55% 45%",
    description:
      "Nature-Based OT Groups are therapist-led outdoor occupational therapy groups designed for children who may need support with regulation, motor skills, sensory processing, social participation, confidence, transitions, or emotional development. Led by a licensed occupational therapist, these groups combine purposeful play, movement, sensory-rich outdoor experiences, family collaboration, and progress tracking in a supportive natural environment.",
    details: [
      "Led by a licensed occupational therapist",
      "Supports regulation, coordination, motor confidence, social participation, emotional regulation, and outdoor confidence",
      "Includes family collaboration and goal-informed support",
      "Progress notes or caregiver updates may be provided depending on program structure",
      "Good fit for children who struggle in traditional indoor settings",
    ],
    badges: ["Therapist-Led", "Best for Regulation Support", "Outdoor Play"],
    prices: [
      { label: "Per group session", amount: 85, checkoutSlug: "ot-group" },
      { label: "6-week group series", amount: 480, checkoutSlug: "ot-group-series" },
    ],
    ctas: [
      { label: "Select OT Group", href: "/checkout/ot-group", variant: "primary" },
      { label: "Book 6-Week Series", href: "/checkout/ot-group-series", variant: "primary" },
      { label: "Book Parent Fit Call", href: "/book-call?service=ot-group", variant: "outline" },
      { label: "Join OT Group Waitlist", href: "/waitlist?service=ot-group", variant: "outline" },
    ],
  },
  {
    key: "reflex",
    name: "Reflex Integration Intensive",
    imageKey: "reflexCoaching",
    imagePosition: "50% 40%",
    description:
      "A 4-week virtual intensive designed to help children build coordination, body awareness, self-regulation, attention, and confidence through guided movement-based activities. Each plan is individualized based on assessment findings and family goals. Families complete short daily video-guided exercises at home, using common household objects, with a 30-minute commitment each day for 4 weeks.",
    details: [
      "Virtual program completed at home",
      "Four-week model",
      "Requires approximately 30 minutes per day",
      "Exercises should be completed consistently and consecutively for at least 30 days",
      "Uses guided video exercises and common household objects",
      "Designed to support integration of retained primitive reflexes",
    ],
    badges: ["Virtual Intensive", "At-Home Program", "Best for Regulation Support"],
    prices: [{ label: "4-week virtual intensive", amount: 497, checkoutSlug: "reflex" }],
    ctas: [
      { label: "Start Reflex Intensive", href: "/checkout/reflex", variant: "primary" },
      { label: "Learn More", href: "/services#reflex-intensive", variant: "outline" },
      {
        label: "Ask If This Is Right for My Child",
        href: "/get-started?service=reflex",
        variant: "outline",
      },
    ],
  },
];

export const NATURE_OT_FIT_SIGNALS = [
  "Frequent meltdowns or difficulty managing big emotions",
  "Trouble focusing or sitting still, especially in structured environments",
  "Sensory sensitivities to sound, touch, or movement",
  "Delayed gross or fine motor skills such as balance, coordination, or handwriting",
  "Challenges with social interaction or peer play",
  "Difficulty transitioning between tasks or environments",
  "Low confidence, anxiety, avoidance, or shutting down in new settings",
  "A strong need for movement or outdoor time to stay regulated",
] as const;

export const NATURE_OT_FIT_CLOSING =
  "At TreeTots, we offer nature-based therapy and play experiences that meet your child where they are: outdoors, where movement, connection, and curiosity come naturally. Whether your child struggles with focus, emotional regulation, coordination, or confidence, our child-led and therapist-guided programs support growth through play, exploration, and meaningful participation.";

export type CheckoutOption = {
  slug: CheckoutSlug;
  name: string;
  amount: number;
  defaultLocation: "outdoor" | "virtual";
  priceId: string | undefined;
  description: string;
  included: string[];
};

const CHECKOUT_OPTIONS: Record<
  CheckoutSlug,
  Omit<CheckoutOption, "priceId"> & { priceEnvKey: string }
> = {
  "nature-play-dropin": {
    slug: "nature-play-dropin",
    name: "Nature Play Groups (Drop-In)",
    amount: 35,
    defaultLocation: "outdoor",
    priceEnvKey: PRICE_ENV["nature-play-dropin"],
    description:
      "One child-led outdoor play session focused on movement, imagination, peer connection, and confidence in a relaxed natural setting.",
    included: [
      "One outdoor Nature Play Group session",
      "Child-led, play-based facilitation (not individualized OT)",
      "Outdoor exploration and peer connection in a natural setting",
    ],
  },
  "nature-play-pass": {
    slug: "nature-play-pass",
    name: "Nature Play Groups (6-Session Pass)",
    amount: 180,
    defaultLocation: "outdoor",
    priceEnvKey: PRICE_ENV["nature-play-pass"],
    description:
      "Six sessions of purposeful outdoor play for families who want consistent social connection and movement without formal therapy.",
    included: [
      "Six Nature Play Group sessions",
      "Child-led outdoor play and peer connection",
      "Best for families seeking regular outdoor play (not individualized OT)",
    ],
  },
  "ot-group": {
    slug: "ot-group",
    name: "Nature-Based OT Group (Per Session)",
    amount: 85,
    defaultLocation: "outdoor",
    priceEnvKey: PRICE_ENV["ot-group"],
    description:
      "One therapist-led outdoor OT group session supporting regulation, motor skills, sensory processing, social participation, and confidence.",
    included: [
      "One licensed OT-led outdoor group session",
      "Purposeful play, movement, and sensory-rich outdoor experiences",
      "Family collaboration and goal-informed support",
      "Participation subject to group fit review",
    ],
  },
  "ot-group-series": {
    slug: "ot-group-series",
    name: "Nature-Based OT Group (6-Week Series)",
    amount: 480,
    defaultLocation: "outdoor",
    priceEnvKey: PRICE_ENV["ot-group-series"],
    description:
      "A six-week therapist-led outdoor OT group series with family collaboration and progress-oriented support in nature.",
    included: [
      "Six weeks of licensed OT-led outdoor group sessions",
      "Regulation, motor, sensory, and social participation support",
      "Family collaboration and goal-informed programming",
      "Caregiver updates may be provided depending on program structure",
    ],
  },
  reflex: {
    slug: "reflex",
    name: "Reflex Integration Intensive",
    amount: 497,
    defaultLocation: "virtual",
    priceEnvKey: PRICE_ENV.reflex,
    description:
      "A 4-week virtual intensive designed to help children build coordination, body awareness, self-regulation, attention, and confidence through guided movement-based activities. Each plan is individualized based on assessment findings and family goals. Families complete short daily video-guided exercises at home, using common household objects, with a 30-minute commitment each day for 4 weeks.",
    included: [
      "Four-week virtual intensive with guided video instruction",
      "Approximately 30 minutes of daily home exercises",
      "Uses common household items",
      "Designed to support reflex integration (not emergency or crisis care)",
    ],
  },
};

export function getCheckoutOption(slug: string): CheckoutOption | null {
  const base = CHECKOUT_OPTIONS[slug as CheckoutSlug];
  if (!base) return null;
  const priceId = process.env[base.priceEnvKey]?.trim() || undefined;
  return {
    slug: base.slug,
    name: base.name,
    amount: base.amount,
    defaultLocation: base.defaultLocation,
    priceId,
    description: base.description,
    included: base.included,
  };
}

export function isCheckoutSlug(slug: string): slug is CheckoutSlug {
  return slug in CHECKOUT_OPTIONS;
}

/** Validates Stripe price id matches the catalog entry for a checkout slug. */
export function isPriceIdForCheckoutSlug(slug: CheckoutSlug, priceId: string): boolean {
  const option = getCheckoutOption(slug);
  const expected = option?.priceId?.trim();
  const received = priceId.trim();
  return Boolean(expected && received && expected === received);
}

/** Hash anchor on /services for a completed checkout slug. */
export function servicesPageAnchorForCheckoutSlug(slug: CheckoutSlug): string {
  if (slug.startsWith("nature-play")) return "nature-play";
  if (slug.startsWith("ot-group")) return "ot-group";
  return "reflex-intensive";
}

export function getCatalogService(key: string): CatalogService | undefined {
  return SERVICES_CATALOG.find((s) => s.key === key);
}
