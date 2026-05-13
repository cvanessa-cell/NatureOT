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

const serviceImagePositions: Record<string, string> = {
  "Nature OT Groups": "15% 50%",
  "Individual OT": "40% 50%",
  "Summer Camps": "65% 50%",
  "Parent Workshops": "85% 50%",
};

const defaultServices: ServiceData[] = [
  { title: "Nature OT Groups", description: "Weekly small-group sessions supporting regulation, motor confidence, social skills, and everyday independence through guided nature-based play.", iconName: "Leaf", href: "/groups" },
  { title: "Individual OT", description: "One-on-one sessions designed around your child\u2019s unique goals, strengths, sensory needs, and daily routines.", iconName: "CircleUserRound", href: "/about" },
  { title: "Summer Camps", description: "Fun, structured outdoor camps that build confidence, friendships, resilience, and independence over the summer.", iconName: "Sun", href: "/groups" },
  { title: "Parent Workshops", description: "Practical strategies and tools to support your child at home, outdoors, and in the community.", iconName: "GraduationCap", href: "/workshops" },
];

export function ServicesGrid({ data }: { data?: ServiceData[] | null }) {
  const services = data?.length ? data : defaultServices;

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

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => {
            const Icon = resolveIcon(s.iconName);
            return (
              <Link
                key={s.title}
                href={s.href || "/groups"}
                className="group flex flex-col overflow-hidden rounded-2xl border border-sand/70 bg-card shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={treetotsImages.servicesArea}
                    alt={treetotsImageAlt.servicesArea}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    style={{ objectPosition: serviceImagePositions[s.title ?? ""] ?? "50% 50%" }}
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
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-forest/65">
                    {s.description}
                  </p>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-moss transition group-hover:text-forest">
                    Learn More
                    <ArrowRight className="ml-1 size-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
