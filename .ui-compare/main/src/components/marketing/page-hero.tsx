import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { treetotsImageAlt, treetotsImages, type TreetotsImageKey } from "@/lib/treetots-images";

type HeroAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

export function PageHero({
  eyebrow,
  title,
  description,
  imageKey = "otGroupHammockPlay",
  imagePosition = "55% 45%",
  actions = [],
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description: string;
  imageKey?: TreetotsImageKey;
  imagePosition?: string;
  actions?: HeroAction[];
  align?: "left" | "center";
}) {
  return (
    <section className="relative overflow-hidden border-b border-sand/80 bg-gradient-to-b from-cream to-white/50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(31,77,58,0.10),_transparent_55%)]" />
      <div
        className={cn(
          "relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 lg:grid-cols-2 lg:gap-12 lg:px-6 lg:py-16",
          align === "center" && "lg:grid-cols-[1.05fr_0.95fr]",
        )}
      >
        <div className={cn("relative z-10", align === "center" ? "text-center lg:text-left" : "text-center lg:text-left")}>
          <p className="text-sm font-semibold uppercase tracking-wider text-moss">{eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-forest sm:text-5xl">
            {title}
          </h1>
          <p className="font-lead mx-auto mt-4 max-w-2xl text-lg text-bark/90 lg:mx-0">
            {description}
          </p>
          {actions.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn(
                    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold transition",
                    action.variant === "secondary"
                      ? "border-2 border-forest/20 bg-white/80 text-forest hover:border-forest/35 hover:bg-white"
                      : "bg-forest text-cream shadow-md shadow-forest/15 hover:bg-forest/90 hover:shadow-lg",
                  )}
                >
                  {action.label}
                  {action.variant !== "secondary" && <ArrowRight className="size-3.5" aria-hidden />}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-sand/70 shadow-lg shadow-forest/10 lg:max-w-none">
          <Image
            src={treetotsImages[imageKey]}
            alt={treetotsImageAlt[imageKey]}
            fill
            sizes="(min-width: 1024px) 50vw, 90vw"
            className="object-cover"
            style={{ objectPosition: imagePosition }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/18 to-transparent" />
        </div>
      </div>
    </section>
  );
}
