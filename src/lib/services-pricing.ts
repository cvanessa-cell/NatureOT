import type { CatalogService, ServicePrice } from "@/lib/services-catalog";

const SAVINGS_HINT: Partial<Record<string, Partial<Record<string, string>>>> = {
  "nature-play": {
    "nature-play-pass": "Save $30 vs six drop-ins",
  },
  "ot-group": {
    "ot-group-series": "Save $30 vs six single sessions",
  },
};

const PER_SESSION_COUNT: Partial<Record<string, number>> = {
  "nature-play-pass": 6,
  "ot-group-series": 6,
};

export function priceSavingsHint(
  serviceKey: string,
  price: ServicePrice,
): string | null {
  return SAVINGS_HINT[serviceKey]?.[price.checkoutSlug ?? ""] ?? null;
}

export function pricePerSessionLabel(price: ServicePrice): string | null {
  const count = price.checkoutSlug ? PER_SESSION_COUNT[price.checkoutSlug] : undefined;
  if (!count || count < 2) return null;
  const per = price.amount / count;
  const rounded = Number.isInteger(per) ? per : Math.round(per * 100) / 100;
  return `≈ $${rounded}/session`;
}

export function lowestCheckoutPrice(service: CatalogService): number | null {
  const amounts = service.prices.map((p) => p.amount);
  return amounts.length ? Math.min(...amounts) : null;
}
