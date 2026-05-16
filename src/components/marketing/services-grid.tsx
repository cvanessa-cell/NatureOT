import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { resolveIcon } from "@/sanity/lib/icon-map";
import { treetotsImages, treetotsImageAlt } from "@/lib/treetots-images";

interface ServiceData {
  _id?: string;
  title?: string;
  description?: string;
  iconName?: string;
  href?: string;
}

const SERVICE_CARD_MEDIA = [
  {
    src: treetotsImages.servicesCardLeft,
    alt: treetotsImageAlt.servicesCardLeft,
    objectPosition: "50% 35%" as const,
  },
  {
    src: treetotsImages.servicesArea,
    alt: treetotsImageAlt.servicesArea,
    objectPosition: "62% 50%" as const,
  },
] as const;

const PLACEHOLDER_SLOTS: ServiceData[] = [
  {
    _id: "service-slot-1",
    title: "Service title",
    description: "Add a short description of this offering when you\u2019re ready.",
    iconName: "Leaf",
  },
  {
    _id: "service-slot-2",
    title: "Service title",
    description: "Add a short description of this offering when you\u2019re ready.",
    iconName: "CircleUserRound",
  },
];

function servicesForGrid(data?: ServiceData[] | null): ServiceData[] {
  const fromCms =
    data?.filter((s) => (s.title?.trim()?.length ?? 0) > 0).slice(0, 2) ?? [];
  const out = [...fromCms];
  let p = 0;
  while (out.length < 2) {
    out.push({ ...PLACEHOLDER_SLOTS[p], _id: `${PLACEHOLDER_SLOTS[p]._id}-pad-${fromCms.length}` });
    p += 1;
  }
  return out.slice(0, 2);
}

export function ServicesGrid({ data }: { data?: ServiceData[] | null }) {
  const services = servicesForGrid(data);

  return (
    <section className="bg-ivory py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-moss">What We Offer</p>
          <h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-forest sm:text-4xl">
            Our Nature-Based OT Services
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-forest/65">
            Meaningful support. Real-world skills. Lasting impact.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {services.map((s, index) => {
            const Icon = resolveIcon(s.iconName);
            const isLinked = Boolean(s.href?.trim());
            const outerClassName =
              "group flex flex-col overflow-hidden rounded-2xl border border-sand/70 bg-card shadow-sm transition hover:shadow-lg hover:-translate-y-0.5";
            const media = SERVICE_CARD_MEDIA[index] ?? SERVICE_CARD_MEDIA[0];

            const inner = (
              <>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={media.src}
                    alt={media.alt}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    style={{ objectPosition: media.objectPosition }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/25 to-transparent" />
                  <span className="absolute bottom-3 left-3 flex size-10 items-center justify-center rounded-full bg-cream/95 shadow-md">
                    <Icon className="size-5 text-moss" aria-hidden />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-forest">
                    {s.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-forest/65">{s.description}</p>
                  {isLinked ? (
                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-moss transition group-hover:text-forest">
                      Learn More
                      <ArrowRight className="ml-1 size-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  ) : (
                    <span className="mt-4 text-sm font-medium text-forest/40">Coming soon</span>
                  )}
                </div>
              </>
            );

            const key = s._id ?? s.title ?? `service-${index}`;

            return isLinked ? (
              <Link key={key} href={s.href!} className={outerClassName}>
                {inner}
              </Link>
            ) : (
              <div key={key} className={`${outerClassName} cursor-default hover:shadow-sm hover:translate-y-0`}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
