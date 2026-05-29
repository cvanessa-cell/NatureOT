import Link from "next/link";
import { ArrowRight, CheckCircle2, Leaf } from "lucide-react";
import { MEMBERSHIP_PLAN } from "@/lib/membership-catalog";
import { cn } from "@/lib/cn";

const highlights = [
  "$49/month",
  "$499/year",
  "Priority access",
  "Monthly caregiver guide",
  "Early access to workshops and seasonal groups",
] as const;

export function MembershipPromoSection({ className }: { className?: string }) {
  return (
    <section id="membership" className={cn("mt-10", className)}>
      <div className="rounded-[2rem] border border-sage/45 bg-gradient-to-br from-white via-cream/80 to-sage/25 p-5 shadow-sm shadow-forest/10 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-moss">
              Want ongoing support between groups?
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-forest">
              {MEMBERSHIP_PLAN.name}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-bark/90">
              A monthly or annual membership for families who want priority access, caregiver
              resources, nature play opportunities, and ongoing connection with TreeTots.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-sand/70 bg-white/90 p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-sage text-forest">
                <Leaf className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold text-forest">
                  Family membership add-on
                </h3>
                <p className="text-sm text-forest/60">Community, resources, and priority access</p>
              </div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {highlights.map((item) => (
                <p key={item} className="flex gap-2 text-sm font-medium text-forest/75">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-moss" aria-hidden />
                  <span>{item}</span>
                </p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/membership"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-cream shadow-sm transition hover:bg-forest/90"
              >
                Join Membership
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
              <Link
                href="/membership#pricing"
                className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-forest/25 bg-white px-5 text-sm font-semibold text-forest transition hover:bg-cream/60"
              >
                Compare Options
              </Link>
              <Link
                href="/book-call?service=membership"
                className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-moss/25 bg-white px-5 text-sm font-semibold text-moss transition hover:bg-cream/60"
              >
                Ask If This Is a Good Fit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
