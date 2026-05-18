import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { CatalogService } from "@/lib/services-catalog";
import { treetotsImageAlt, treetotsImages } from "@/lib/treetots-images";
import { ServiceBadges } from "./service-badges";

const ACCENT: Record<string, string> = {
  "nature-play": "border-l-moss",
  "ot-group": "border-l-sky-600",
  reflex: "border-l-amber-600/80",
};

export function ServiceCard({
  service,
  id,
  compact = false,
  imageOnRight = false,
}: {
  service: CatalogService;
  id?: string;
  compact?: boolean;
  /** Alternate image placement on full /services page for visual rhythm. */
  imageOnRight?: boolean;
}) {
  const accent = ACCENT[service.key] ?? "border-l-sage";
  const imageSrc = service.imageKey ? treetotsImages[service.imageKey] : null;
  const imageAlt = service.imageKey ? treetotsImageAlt[service.imageKey] : "";
  const objectPosition = service.imagePosition ?? "50% 50%";

  const media = imageSrc ? (
    <div className="relative min-h-[200px] w-full shrink-0 overflow-hidden sm:min-h-[220px] lg:min-h-0 lg:w-[42%]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="(min-width: 1024px) 42vw, 100vw"
        className="object-cover transition duration-500 group-hover:scale-[1.02]"
        style={{ objectPosition }}
        priority={service.key === "nature-play"}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-forest/20 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-forest/10" />
    </div>
  ) : null;

  const body = (
    <div
      className={cn(
        "flex flex-1 flex-col",
        compact ? "p-5 sm:p-6" : "p-6 sm:p-8",
        media && "lg:py-7",
      )}
    >
      <h2 className="font-display text-2xl font-semibold text-forest sm:text-[1.65rem]">
        {service.name}
      </h2>
      <div className="mt-3">
        <ServiceBadges badges={service.badges} />
      </div>
      <p
        className={cn(
          "mt-4 leading-relaxed text-bark/90",
          compact ? "line-clamp-4 text-sm" : "text-sm sm:text-base",
        )}
      >
        {service.description}
      </p>
      {!compact && (
        <ul className="mt-4 space-y-2 text-sm text-forest/75">
          {service.details.map((detail) => (
            <li key={detail} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-moss/70" aria-hidden />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        {service.prices.map((price) => (
          <div
            key={price.label}
            className="rounded-2xl border border-sage/40 bg-cream/60 px-4 py-2.5"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-forest/55">
              {price.label}
            </p>
            <p className="font-display text-xl font-semibold text-moss">${price.amount}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {service.ctas.map((cta) => (
          <Link
            key={cta.label}
            href={cta.href}
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
              cta.variant === "primary"
                ? "bg-forest text-cream shadow-sm hover:bg-forest/90"
                : "border-2 border-forest/25 bg-white/90 text-forest hover:border-forest/40 hover:bg-cream/60",
            )}
          >
            {cta.label}
          </Link>
        ))}
      </div>
      {!compact && (
        <p className="mt-5 border-t border-sand/60 pt-4 text-xs leading-relaxed text-forest/55">
          Participation recommendations may vary based on group fit and child needs.
        </p>
      )}
    </div>
  );

  return (
    <Card
      id={id}
      className={cn(
        "group overflow-hidden border-l-4 shadow-md shadow-forest/5",
        accent,
        media ? "p-0" : compact ? "p-5 sm:p-6" : "p-6 sm:p-8",
      )}
    >
      <div
        className={cn(
          "flex h-full flex-col",
          media && "lg:flex-row",
          media && imageOnRight && "lg:flex-row-reverse",
        )}
      >
        {media}
        {body}
      </div>
    </Card>
  );
}
