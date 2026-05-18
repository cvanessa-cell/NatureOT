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
  ctaLabel?: string;
}

const SERVICE_CARD_MEDIA = [
  {
    src: treetotsImages.otGroupHammockPlay,
    alt: treetotsImageAlt.otGroupHammockPlay,
    objectPosition: "55% 45%" as const,
  },
  {
    src: treetotsImages.homeschoolNature,
    alt: treetotsImageAlt.homeschoolNature,
    objectPosition: "50% 40%" as const,
  },
  {
    src: treetotsImages.workshopFamilies,
    alt: treetotsImageAlt.workshopFamilies,
    objectPosition: "50% 45%" as const,
  },
  {
    src: treetotsImages.providerSection,
    alt: treetotsImageAlt.providerSection,
    objectPosition: "50% 48%" as const,
  },
] as const;

const FALLBACK_SERVICES: ServiceData[] = [
  {
    _id: "service-slot-groups",
    title: "Nature OT Groups",
    description:
      "Therapist-led small groups that help children practice regulation, motor planning, social participation, and outdoor confidence in a supportive setting.",
    iconName: "Leaf",
    href: "/groups",
    ctaLabel: "Explore groups",
  },
  {
    _id: "service-slot-homeschool",
    title: "Homeschool + After-School Options",
    description:
      "Flexible outdoor group options for families who want structured OT support woven into the school week or afternoon routine.",
    iconName: "Compass",
    href: "/homeschool-groups",
    ctaLabel: "See family options",
  },
  {
    _id: "service-slot-workshops",
    title: "Parent Workshops",
    description:
      "Parent-friendly education events that explain how outdoor, goal-directed OT supports participation without overwhelming families with clinical jargon.",
    iconName: "GraduationCap",
    href: "/workshops",
    ctaLabel: "View workshops",
  },
  {
    _id: "service-slot-referral",
    title: "Provider Referrals",
    description:
      "A simple referral path for pediatricians, counselors, schools, therapists, and community partners who want a clear next step for families.",
    iconName: "HandHeart",
    href: "/provider-referral",
    ctaLabel: "Refer a family",
  },
];

function servicesForGrid(data?: ServiceData[] | null): ServiceData[] {
  const fromCms =
    data?.filter((s) => (s.title?.trim()?.length ?? 0) > 0).slice(0, 4) ?? [];
  const out = [...fromCms];
  let p = 0;
  while (out.length < 4) {
    out.push({ ...FALLBACK_SERVICES[p], _id: `${FALLBACK_SERVICES[p]._id}-pad-${out.length}` });
    p += 1;
  }
  return out.slice(0, 4);
}

export function ServicesGrid({ data }: { data?: ServiceData[] | null }) {
  const services = servicesForGrid(data);

  return (
    <section className="bg-ivory py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-moss">What We Offer</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-forest sm:text-4xl">
            Our Nature-Based OT Services
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-forest/65">
            Clear next steps for families, homeschool groups, and referral partners who want
            therapist-led outdoor support that feels warm, practical, and easy to understand.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:gap-7">
          {services.map((s, index) => {
            const Icon = resolveIcon(s.iconName);
            const isLinked = Boolean(s.href?.trim());
            const ctaLabel = s.ctaLabel?.trim() || "Learn more";
            const outerClassName =
              "group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-sand/70 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg";
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
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="font-display text-xl font-semibold text-forest">
                    {s.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-forest/68 sm:text-[0.96rem]">
                    {s.description}
                  </p>
                  {isLinked ? (
                    <span className="mt-5 inline-flex items-center text-sm font-semibold text-moss transition group-hover:text-forest">
                      {ctaLabel}
                      <ArrowRight className="ml-1 size-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  ) : (
                    <span className="mt-5 text-sm font-medium text-forest/50">Details coming soon</span>
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

        <div className="mt-8 rounded-[1.75rem] border border-sage/45 bg-white/80 px-5 py-4 text-center shadow-sm shadow-forest/5 sm:px-6">
          <p className="text-sm leading-relaxed text-forest/70">
            <Link href="/services" className="font-semibold text-moss underline underline-offset-4">
              View all services &amp; pricing
            </Link>
            {" · "}
            Not sure which option fits?
            <Link href="/book-call" className="ml-1 font-semibold text-moss underline underline-offset-4">
              Book a parent call
            </Link>
            {" "}for a gentle next step.
          </p>
        </div>
      </div>
    </section>
  );
}
