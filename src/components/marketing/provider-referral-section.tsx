import Image from "next/image";
import Link from "next/link";
import { Check, Heart, FileText, ArrowRight } from "lucide-react";
import { treetotsImages, treetotsImageAlt } from "@/lib/treetots-images";

interface ProviderProps {
  heading?: string | null;
  subheading?: string | null;
  body?: string | null;
  bullets?: string[] | null;
}

const defaultBullets = [
  "Simple, streamlined referral process",
  "School and clinic partnerships",
  "Staff development resources",
  "Parent education workshops",
  "Community outreach events",
];

export function ProviderReferralSection({ data }: { data?: ProviderProps | null }) {
  const heading = data?.heading || "For Providers & Schools";
  const subheading = data?.subheading || "Partner with us to support more kids in your community.";
  const body =
    data?.body ||
    "We collaborate with pediatricians, therapists, schools, ABA clinics, homeschool communities, and other professionals who support children and families across DFW.";
  const bullets = data?.bullets?.length ? data.bullets : defaultBullets;

  return (
    <section className="bg-ivory py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-moss">Referral Partners</p>
            <h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-forest sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-3 text-lg text-forest/65">{subheading}</p>
            <p className="mt-4 leading-relaxed text-forest/75">{body}</p>
            <ul className="mt-6 space-y-2.5">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-2.5">
                  <Check className="size-5 shrink-0 text-moss" aria-hidden />
                  <span className="text-sm text-forest/75">{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/referral-partners" className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold text-white shadow-md shadow-terracotta/20 transition hover:bg-terracotta/90 hover:shadow-lg">
                <Heart className="size-4" aria-hidden />
                Refer a Child
                <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link href="/referral-partners" className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-forest/20 bg-white/80 px-6 text-sm font-semibold text-forest transition hover:border-forest/35 hover:bg-white">
                <FileText className="size-4" aria-hidden />
                Download Referral Sheet
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-3xl shadow-xl">
              <Image
                src={treetotsImages.providerSection}
                alt={treetotsImageAlt.providerSection}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-forest/5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
