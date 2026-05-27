import { resolveIcon } from "@/sanity/lib/icon-map";

interface WhyNatureProps {
  headline?: string | null;
  body?: string | null;
  items?: { iconName?: string; label?: string }[] | null;
}

const defaultItems = [
  { iconName: "Brain", label: "Improve Sensory Processing" },
  { iconName: "Eye", label: "Increase Focus & Attention" },
  { iconName: "Heart", label: "Build Emotional Regulation" },
  { iconName: "Mountain", label: "Boost Confidence & Resilience" },
  { iconName: "Activity", label: "Enhance Motor Skills" },
  { iconName: "Users", label: "Support Social Connection" },
];

export function WhyNature({ data }: { data?: WhyNatureProps | null }) {
  const headline = data?.headline || "Why Nature?";
  const body =
    data?.body ||
    "Research shows that outdoor environments provide uniquely rich opportunities for movement, sensory exploration, problem-solving, confidence-building, and social connection.";
  const items = data?.items?.length ? data.items : defaultItems;

  return (
    <section className="bg-cream py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-moss">The Science Behind It</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-forest sm:text-4xl">
          {headline}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-forest/65">{body}</p>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => {
            const Icon = resolveIcon(item.iconName);
            return (
              <div key={item.label} className="flex flex-col items-center gap-3">
                <span className="flex size-16 items-center justify-center rounded-2xl bg-sage/25 text-forest shadow-sm transition hover:bg-sage/40">
                  <Icon className="size-7" aria-hidden />
                </span>
                <p className="text-sm font-medium leading-snug text-forest">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
