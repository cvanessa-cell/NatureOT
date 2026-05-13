import Image from "next/image";
import { resolveIcon } from "@/sanity/lib/icon-map";
import { treetotsImages, treetotsImageAlt } from "@/lib/treetots-images";

interface TrustBandProps {
  headline?: string | null;
  body?: string | null;
  stats?: { iconName?: string; value?: string; label?: string }[] | null;
}

const defaultStats = [
  { iconName: "Calendar", value: "12+", label: "Years of Experience" },
  { iconName: "Heart", value: "100+", label: "Families Served" },
  { iconName: "Users", value: "Small", label: "Groups for Big Impact" },
  { iconName: "MapPin", value: "DFW", label: "Local & Community Focused" },
];

export function TrustBand({ data }: { data?: TrustBandProps | null }) {
  const headline = data?.headline || "Therapy That Meets Kids Where They Are";
  const body =
    data?.body ||
    "We combine the healing power of nature with the proven science of occupational therapy to help children build skills for a life of independence and joy.";
  const stats = data?.stats?.length ? data.stats : defaultStats;

  return (
    <section className="wavy-both relative bg-forest py-20 text-cream lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:items-center lg:gap-16">
          <div>
            <div className="relative mb-7 size-32 overflow-hidden rounded-full border-[3px] border-sage/30 shadow-xl sm:size-36">
              <Image
                src={treetotsImages.trustBandChildren}
                alt={treetotsImageAlt.trustBandChildren}
                fill
                sizes="144px"
                className="object-cover"
              />
            </div>
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold leading-tight sm:text-4xl">
              {headline}
            </h2>
            <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-cream/75">
              {body}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {stats.map((s) => {
              const Icon = resolveIcon(s.iconName);
              return (
                <div key={s.label} className="rounded-2xl border border-cream/8 bg-cream/6 px-5 py-6 text-center">
                  <Icon className="mx-auto size-6 text-gold" aria-hidden />
                  <p className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl font-bold leading-none">
                    {s.value}
                  </p>
                  <p className="mt-2 text-sm text-cream/65">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
