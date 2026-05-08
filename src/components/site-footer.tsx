import Link from "next/link";
import { Mail } from "lucide-react";

const explore = [
  { href: "/groups", label: "Groups" },
  { href: "/workshops", label: "Workshops" },
  { href: "/parent-guide", label: "Parent guide" },
  { href: "/quiz", label: "Interactive guide" },
  { href: "/referral-partners", label: "Referral partners" },
];

const action = [
  { href: "/waitlist", label: "Join the waitlist" },
  { href: "/book-call", label: "Book a parent call" },
  { href: "/get-started", label: "Connect" },
];

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/faq", label: "FAQ" },
  { href: "/api/unsubscribe", label: "Unsubscribe help" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-sand/80 bg-forest text-cream">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="font-[family-name:var(--font-fraunces)] text-lg font-semibold">
              Nature OT Growth OS
            </p>
            <p className="text-sm leading-relaxed text-cream/85">
              Educational information about nature-based pediatric occupational
              therapy groups in Texas. This site does not replace an individualized
              occupational therapy evaluation and does not establish a
              provider–patient relationship.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cream/70">
              Explore
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {explore.map((x) => (
                <li key={x.href}>
                  <Link
                    className="text-cream/90 underline-offset-4 hover:underline"
                    href={x.href}
                  >
                    {x.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cream/70">
              Take action
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {action.map((x) => (
                <li key={x.href}>
                  <Link
                    className="text-cream/90 underline-offset-4 hover:underline"
                    href={x.href}
                  >
                    {x.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-cream/70">
              Legal & contact
            </p>
            <ul className="space-y-2 text-sm">
              {legal.map((x) => (
                <li key={x.href}>
                  <Link
                    className="text-cream/90 underline-offset-4 hover:underline"
                    href={x.href}
                  >
                    {x.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="flex items-start gap-2 pt-2 text-sm text-cream/85">
              <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Prefer email? Use the contact path shared after you join the
                waitlist or book a call.
              </span>
            </p>
          </div>
        </div>
        <div className="mt-10 rounded-2xl border border-cream/15 bg-forest/80 p-4 text-xs leading-relaxed text-cream/75">
          <strong className="font-medium text-cream">Disclaimer:</strong>{" "}
          Outcomes vary by child. Group fit depends on age, developmental needs,
          safety, schedule, and social fit—not every outdoor group is appropriate
          for every family.
        </div>
        <p className="mt-8 text-sm text-cream/65">
          © {new Date().getFullYear()} Nature OT Growth OS
        </p>
      </div>
    </footer>
  );
}
