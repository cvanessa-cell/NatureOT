import Link from "next/link";
import { resolveIcon } from "@/sanity/lib/icon-map";

interface ConcernProps {
  headline?: string | null;
  items?: { iconName?: string; label?: string }[] | null;
  supportText?: string | null;
}

const defaultItems = [
  { iconName: "Sparkles", label: "Sensory Overwhelm" },
  { iconName: "Footprints", label: "Coordination & Motor Skills" },
  { iconName: "CloudLightning", label: "Big Emotions & Meltdowns" },
  { iconName: "Users", label: "Social Skills & Friendships" },
  { iconName: "Shield", label: "Low Confidence or Avoidance" },
  { iconName: "Repeat", label: "Difficulty with Transitions" },
  { iconName: "Shirt", label: "Difficulty with Everyday Tasks" },
];

export function ConcernCards({ data }: { data?: ConcernProps | null }) {
  const headline = data?.headline || "Does Any of This Sound Familiar?";
  const items = data?.items?.length ? data.items : defaultItems;
  const supportText = data?.supportText || "You\u2019re not alone \u2014 and we\u2019re here to help.";

  return (
    <section className="bg-cream py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-moss">Common Concerns</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-forest sm:text-4xl">
          {headline}
        </h2>
        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-7 lg:gap-6">
          {items.map((c) => {
            const Icon = resolveIcon(c.iconName);
            return (
              <div key={c.label} className="group flex flex-col items-center gap-3">
                <div className="flex size-20 items-center justify-center rounded-full bg-sage/30 shadow-sm transition group-hover:bg-sage/45 group-hover:shadow-md sm:size-24">
                  <Icon className="size-7 text-forest/55 transition group-hover:text-forest/75 sm:size-8" aria-hidden />
                </div>
                <p className="text-sm font-medium leading-snug text-forest">{c.label}</p>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-12 max-w-lg text-forest/60">
          Many families come to us when they notice their child could use a little extra support.
        </p>

        <p className="mt-6 text-lg font-medium text-forest/70">{supportText}</p>
        <Link href="/groups" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border-2 border-forest/20 bg-white/80 px-8 text-base font-semibold text-forest transition hover:border-forest/35 hover:bg-white">
          See How We Can Help
        </Link>
      </div>
    </section>
  );
}
