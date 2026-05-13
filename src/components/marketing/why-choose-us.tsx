import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { treetotsImages, treetotsImageAlt } from "@/lib/treetots-images";

const reasons = [
  "Experienced, Licensed Pediatric OT",
  "Nature-Based & Evidence-Informed",
  "Small Group Sizes (4–6 Kids)",
  "Family Collaboration & Support",
  "Regular Progress Updates",
  "Safe, Supportive Environment",
];

export function WhyChooseUs() {
  return (
    <div className="overflow-hidden rounded-2xl border border-sand/70 bg-card shadow-sm">
      <div className="relative h-36">
        <Image
          src={treetotsImages.whyFamiliesChooseArea}
          alt={treetotsImageAlt.whyFamiliesChooseArea}
          fill
          sizes="(min-width: 1024px) 35vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
      </div>

      <div className="px-6 pb-6 lg:px-7 lg:pb-7">
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-forest">
          Why Families Choose Us
        </h3>

        <ul className="mt-5 space-y-2.5">
          {reasons.map((r) => (
            <li key={r} className="flex items-start gap-2.5">
              <Check className="mt-0.5 size-4.5 shrink-0 text-moss" aria-hidden />
              <span className="text-sm leading-snug text-forest/75">{r}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/about"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-forest px-6 text-sm font-semibold text-cream shadow-sm transition hover:bg-forest/90"
        >
          Meet Our Team
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
