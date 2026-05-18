import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { treetotsImages, treetotsImageAlt } from "@/lib/treetots-images";

interface ExplainerProps {
  headline?: string | null;
  subtitle?: string | null;
  body?: string | null;
  bullets?: string[] | null;
}

const defaultBullets = [
  "Supports sensory regulation",
  "Builds motor planning and coordination",
  "Encourages confidence and resilience",
  "Creates opportunities for social participation",
  "Helps children practice real-life functional skills",
  "Gives parents strategies for carryover at home",
];

export function NatureOTExplainer({ data }: { data?: ExplainerProps | null }) {
  const headline = data?.headline || "What Is Nature-Based Occupational Therapy?";
  const subtitle = data?.subtitle || "Real therapy. Real nature. Real-life growth.";
  const body =
    data?.body ||
    "Nature-based occupational therapy is therapist-led, goal-directed, play-based OT delivered in outdoor and natural environments. It uses movement, sensory-rich experiences, social play, problem-solving, and meaningful real-world activities to support a child\u2019s development.";
  const bullets = data?.bullets?.length ? data.bullets : defaultBullets;

  return (
    <section className="bg-cream py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-16">
          <div className="relative">
            <div className="relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-3xl shadow-xl lg:mx-auto">
              <Image
                src={treetotsImages.heroWide}
                alt={treetotsImageAlt.heroWide}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
                style={{ objectPosition: "60% 40%" }}
              />
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-forest/5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-moss">Our Approach</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-forest sm:text-4xl">
              {headline}
            </h2>
            <p className="mt-2 text-lg italic text-moss/80">{subtitle}</p>
            <p className="mt-5 leading-relaxed text-forest/75">{body}</p>
            <ul className="mt-6 space-y-2.5">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-5 shrink-0 text-moss" aria-hidden />
                  <span className="text-sm text-forest/75">{b}</span>
                </li>
              ))}
            </ul>
            <Link href="/about" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border-2 border-forest/20 bg-white/80 px-8 text-base font-semibold text-forest transition hover:border-forest/35 hover:bg-white">
              Learn More About Our Approach
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
