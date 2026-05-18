import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { treetotsImageAlt, treetotsImages } from "@/lib/treetots-images";
import { resolveIcon } from "@/sanity/lib/icon-map";

interface HeroProps {
  headline?: string | null;
  highlight?: string | null;
  body?: string | null;
  benefits?: { iconName?: string; label?: string }[] | null;
  trustText?: string | null;
  trustCardItems?: string[] | null;
  trustSubtext?: string | null;
}

const defaultBenefits = [
  { iconName: "ShieldCheck", label: "Supports regulation" },
  { iconName: "Brain", label: "Builds everyday skills" },
  { iconName: "Activity", label: "Encourages motor confidence" },
  { iconName: "Users", label: "Creates connection" },
];

export function HeroSection({ data }: { data?: HeroProps | null }) {
  const headline =
    data?.headline || "Outdoor occupational therapy that helps kids feel more confident, regulated, and ready";
  const highlight = data?.highlight || "in everyday life";
  const body =
    data?.body ||
    "TreeTots offers therapist-led, goal-directed, play-based occupational therapy in outdoor and natural environments for children and families across Dallas-Fort Worth.";
  const benefits = data?.benefits?.length ? data.benefits : defaultBenefits;
  const trustText =
    data?.trustText || "A warm, structured next step for families exploring support outdoors";
  const trustCardItems = data?.trustCardItems?.length
    ? data.trustCardItems
    : ["Therapist-Led", "Goal-Directed", "Play-Based", "Nature-Rooted"];
  const trustSubtext =
    data?.trustSubtext ||
    "Clear service options, gentle guidance, and parent-friendly next steps.";

  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(93,127,74,0.10),_transparent_55%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-10 sm:pb-20 sm:pt-14 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-12 lg:px-6 lg:py-24 xl:gap-20">
        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sage/50 bg-sage/20 px-4 py-1.5">
            <Leaf className="size-3.5 text-moss" aria-hidden />
            <span className="text-xs font-semibold tracking-wide text-forest/80">
              Pediatric Nature-Based OT in Dallas-Fort Worth
            </span>
          </div>

          <h1 className="font-display text-4xl font-semibold leading-[1.12] tracking-tight text-forest sm:text-5xl lg:text-[3.5rem]">
            {headline} <span className="italic text-moss">{highlight}</span>
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-forest/75">{body}</p>

          <ul className="mt-8 grid gap-3 text-left sm:grid-cols-2">
            {benefits.map((b) => {
              const Icon = resolveIcon(b.iconName);
              return (
                <li
                  key={b.label}
                  className="flex items-center gap-3 rounded-2xl border border-sage/50 bg-white/55 px-3.5 py-3 shadow-sm shadow-forest/5 backdrop-blur-sm"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-sage/40 text-forest">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="text-sm font-medium text-forest/70">{b.label}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row" aria-label="Primary actions">
            <Link
              href="/waitlist"
              className="group inline-flex min-h-14 min-w-[12rem] items-center justify-center gap-2 rounded-full bg-forest px-8 text-center text-lg font-semibold text-cream shadow-lg shadow-forest/20 transition hover:bg-forest/90 hover:shadow-xl hover:shadow-forest/25"
            >
              Join the Waitlist
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link
              href="/book-call"
              className="inline-flex min-h-14 min-w-[12rem] items-center justify-center rounded-full border-2 border-forest/20 bg-white/80 px-8 text-center text-lg font-semibold text-forest transition hover:border-forest/35 hover:bg-white"
            >
              Book a Free Parent Call
            </Link>
          </div>
          <p className="mt-3 text-xs text-forest/50">
            No commitment required. We&apos;ll help you decide whether this feels like the right fit.
          </p>

          <div className="mt-7 rounded-[1.75rem] border border-sage/50 bg-white/70 p-4 shadow-lg shadow-forest/5 backdrop-blur-sm">
            <p className="text-sm font-semibold text-forest">{trustText}</p>
            <div className="mt-3 grid gap-2 text-sm text-forest/65 sm:grid-cols-3">
              <p className="rounded-2xl bg-cream/90 px-3 py-2">Outdoor sessions with therapeutic intention</p>
              <p className="rounded-2xl bg-cream/90 px-3 py-2">Clear options for groups, calls, and referrals</p>
              <p className="rounded-2xl bg-cream/90 px-3 py-2">Parent-friendly language with privacy in mind</p>
            </div>
          </div>
        </div>

        <div className="relative lg:-mr-4 xl:-mr-8">
          <svg
            className="pointer-events-none absolute -left-4 top-[10%] z-10 hidden h-[55%] w-12 text-moss/30 lg:block"
            viewBox="0 0 60 400"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M32,0 Q22,50 28,100 Q36,150 24,200 Q16,250 28,300 Q36,350 30,400"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <path d="M26,55 Q12,42 18,32 Q24,40 26,55Z" fill="currentColor" opacity="0.35" />
            <path d="M30,115 Q44,102 38,92 Q32,100 30,115Z" fill="currentColor" opacity="0.3" />
            <path d="M22,175 Q8,162 14,152 Q20,160 22,175Z" fill="currentColor" opacity="0.35" />
            <path d="M30,235 Q44,222 38,212 Q32,220 30,235Z" fill="currentColor" opacity="0.3" />
            <path d="M24,300 Q10,287 16,277 Q22,285 24,300Z" fill="currentColor" opacity="0.35" />
            <path d="M32,360 Q46,347 40,337 Q34,345 32,360Z" fill="currentColor" opacity="0.3" />
          </svg>

          <div className="relative" style={{ filter: "drop-shadow(0 20px 40px rgba(22,63,42,0.12))" }}>
            <div className="hero-organic-mask relative aspect-[4/5] w-full overflow-hidden lg:aspect-[3/4]">
              <Image
                src={treetotsImages.heroCenter}
                alt={treetotsImageAlt.heroCenter}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-[52%_45%]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/12 via-transparent to-transparent" />

              <div className="absolute bottom-4 right-4 z-20 rounded-2xl border border-sage/30 bg-ivory/97 px-5 py-4 shadow-xl backdrop-blur sm:bottom-6 sm:right-6">
                <span className="flex size-9 items-center justify-center rounded-full bg-sage/30 text-forest">
                  <Leaf className="size-4" aria-hidden />
                </span>
                <ul className="mt-3 space-y-1">
                  {trustCardItems.map((t) => (
                    <li key={t} className="text-[0.8rem] font-semibold uppercase tracking-wide text-forest">
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-snug text-forest/55">{trustSubtext}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
