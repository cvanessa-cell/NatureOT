import { Star, Quote } from "lucide-react";

interface TestimonialData {
  _id?: string;
  quote?: string;
  author?: string;
  location?: string;
  rating?: number;
}

const defaultItems: TestimonialData[] = [
  { quote: "My child is more confident, better regulated, and actually asks to go outside now.", author: "A.P.", location: "Plano, TX", rating: 5 },
  { quote: "The group was the highlight of our week. My daughter has grown so much socially and emotionally.", author: "M.K.", location: "Frisco, TX", rating: 5 },
  { quote: "A perfect blend of play and therapy. We saw progress we hadn\u2019t seen in months of traditional sessions.", author: "J.T.", location: "McKinney, TX", rating: 5 },
];

export function Testimonials({ data }: { data?: TestimonialData[] | null }) {
  const items = data?.length ? data : defaultItems;

  return (
    <section className="bg-ivory py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-moss">Parent Voices</p>
          <h2 className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-forest sm:text-4xl">
            What Families Are Saying
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <div key={t.author} className="flex flex-col rounded-2xl border border-sand/70 bg-card p-7 shadow-sm transition hover:shadow-md">
              <div className="flex gap-0.5">
                {[...Array(t.rating || 5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-gold text-gold" aria-hidden />
                ))}
              </div>
              <Quote className="mt-5 size-7 text-moss/70" aria-hidden />
              <blockquote className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-forest/80">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-sand/50 pt-4">
                <span className="flex size-9 items-center justify-center rounded-full bg-sage/40 text-xs font-bold text-forest">
                  {t.author?.replace(/\./g, "")}
                </span>
                <div>
                  <p className="text-sm font-semibold text-forest">{t.author}</p>
                  <p className="text-xs text-forest/50">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
