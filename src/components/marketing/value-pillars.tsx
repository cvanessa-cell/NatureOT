import { resolveIcon } from "@/sanity/lib/icon-map";

interface PillarProps {
  items?: { iconName?: string; label?: string }[] | null;
}

const defaultPillars = [
  { iconName: "HandHeart", label: "OT-Led & Family-Centered" },
  { iconName: "TreePine", label: "Outdoors in Nature" },
  { iconName: "ShieldCheck", label: "Evidence-Based & Play-Based" },
  { iconName: "Users", label: "Small Group Support" },
  { iconName: "MapPin", label: "DFW Local & Community Focused" },
];

export function ValuePillars({ data }: { data?: PillarProps | null }) {
  const items = data?.items?.length ? data.items : defaultPillars;

  return (
    <section className="border-y border-sand/50 bg-sage/15 py-8 lg:py-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 lg:gap-x-14 lg:px-6">
        {items.map((p) => {
          const Icon = resolveIcon(p.iconName);
          return (
            <div key={p.label} className="flex items-center gap-2.5 text-forest">
              <Icon className="size-5 shrink-0 text-moss" aria-hidden />
              <span className="text-sm font-semibold">{p.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
