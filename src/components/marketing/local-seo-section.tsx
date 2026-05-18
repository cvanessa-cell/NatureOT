import { MapPin } from "lucide-react";

interface LocalSeoProps {
  headline?: string | null;
  body?: string | null;
  areas?: string[] | null;
}

const defaultAreas = [
  "Dallas", "Plano", "Frisco", "McKinney", "Allen",
  "Richardson", "Garland", "Southlake", "Collin County",
];

export function LocalSEOSection({ data }: { data?: LocalSeoProps | null }) {
  const headline = data?.headline || "Serving Families Across Dallas\u2013Fort Worth";
  const body =
    data?.body ||
    "We bring nature-based OT to parks and outdoor spaces across the DFW metroplex, meeting families where they are.";
  const areas = data?.areas?.length ? data.areas : defaultAreas;

  return (
    <section className="bg-cream py-16 lg:py-20">
      <div className="mx-auto max-w-4xl px-4 text-center lg:px-6">
        <MapPin className="mx-auto size-8 text-moss/60" aria-hidden />
        <h2 className="mt-4 font-display text-3xl font-semibold text-forest sm:text-4xl">
          {headline}
        </h2>
        <p className="mt-3 text-forest/65">{body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {areas.map((area) => (
            <span key={area} className="rounded-full border border-sand/70 bg-card px-4 py-1.5 text-sm font-medium text-forest shadow-sm">
              {area}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
