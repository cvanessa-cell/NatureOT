import Image from "next/image";
import Link from "next/link";
import { Check, Heart, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { treetotsImages, treetotsImageAlt } from "@/lib/treetots-images";

interface ProviderProps {
  heading?: string | null;
  subheading?: string | null;
  body?: string | null;
  bullets?: string[] | null;
}

const defaultBullets = [
  "Simple, minimum-necessary referral steps",
  "School, clinic, homeschool, and community partnerships",
  "Parent education and printable partner materials",
  "Clear role boundaries around what outdoor OT may support",
];

export function ProviderReferralSection({ data }: { data?: ProviderProps | null }) {
  const heading = data?.heading || "For Providers & Schools";
  const subheading = data?.subheading || "A clear, privacy-conscious referral path for DFW professionals and community partners.";
  const body =
    data?.body ||
    "We collaborate with pediatricians, counselors, therapists, schools, homeschool groups, ABA clinics, and community organizations that want a therapist-led outdoor OT option they can explain confidently to families.";
  const bullets = data?.bullets?.length ? data.bullets : defaultBullets;

  return (
    <section className="bg-ivory py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-moss">Referral Partners</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-forest sm:text-4xl">
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
            <div className="mt-6 rounded-[1.5rem] border border-sage/50 bg-white/75 p-4 shadow-sm shadow-forest/5">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage/35 text-moss">
                  <ShieldCheck className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-forest">Provider-friendly and privacy-aware</p>
                  <p className="mt-1 text-sm leading-relaxed text-forest/68">
                    Families get a warm next step, and partners get a simple packet or contact path
                    without sharing diagnoses, records, or unnecessary child details through the website.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/provider-referral" className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-terracotta px-6 text-sm font-semibold text-white shadow-md shadow-terracotta/20 transition hover:bg-terracotta/90 hover:shadow-lg">
                <Heart className="size-4" aria-hidden />
                Start a Provider Referral
                <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link href="/referral-partners#request-packet" className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-forest/20 bg-white/80 px-6 text-sm font-semibold text-forest transition hover:border-forest/35 hover:bg-white">
                <FileText className="size-4" aria-hidden />
                Request Partner Packet
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
