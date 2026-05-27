import { cn } from "./cn";

type SelectableChoiceVariant = "card" | "chip";

const base: Record<SelectableChoiceVariant, string> = {
  card: "min-h-14 rounded-2xl border-2 px-4 py-3 text-left text-lg transition-[border-color,background-color,box-shadow,ring-width] duration-150",
  chip: "min-h-11 rounded-full border-2 px-4 text-sm transition-[border-color,background-color,box-shadow,ring-width] duration-150",
};

const selected: Record<SelectableChoiceVariant, string> = {
  card: "border-forest bg-white text-forest shadow-md ring-2 ring-forest/30",
  chip: "border-forest bg-white text-forest font-semibold shadow-sm ring-2 ring-forest/25",
};

const unselected: Record<SelectableChoiceVariant, string> = {
  card:
    "border-sage/45 bg-white/80 text-forest hover:border-forest hover:bg-white hover:shadow-md hover:ring-2 hover:ring-forest/35 focus-visible:border-forest focus-visible:bg-white focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-forest/35",
  chip:
    "border-sage/45 bg-cream/70 text-forest hover:border-forest hover:bg-white hover:shadow-sm hover:ring-2 hover:ring-forest/30 focus-visible:border-forest focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-forest/30",
};

/** Shared styles for toggle / single-select option buttons. */
export function selectableChoiceClass(
  isSelected: boolean,
  variant: SelectableChoiceVariant = "card",
) {
  return cn(base[variant], isSelected ? selected[variant] : unselected[variant]);
}
