import Link from "next/link";
import { Leaf, Mail, Globe, Share2 } from "lucide-react";

const explore = [
  { href: "/about", label: "About" },
  { href: "/groups", label: "Groups" },
  { href: "/workshops", label: "Workshops" },
  { href: "/parent-guide", label: "For Parents" },
  { href: "/referral-partners", label: "For Providers" },
  { href: "/faq", label: "FAQ" },
];

const services = [
  { href: "/groups", label: "Nature OT Groups" },
  { href: "/groups", label: "Individual OT" },
  { href: "/groups", label: "Summer Camps" },
  { href: "/workshops", label: "Parent Workshops" },
];

const action = [
  { href: "/waitlist", label: "Join the Waitlist" },
  { href: "/book-call", label: "Book a Parent Call" },
  { href: "/referral-partners", label: "Refer a Child" },
  { href: "/get-started", label: "Contact Us" },
];

const legal = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-evergreen bg-forest text-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-cream/15">
                <Leaf className="size-4 text-sage" />
              </span>
              <span className="font-[family-name:var(--font-fraunces)] text-lg font-semibold">
                TreeTots <span className="text-sage">DFW</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-cream/75">
              Helping kids grow, connect, and thrive through nature-based
              occupational therapy in Dallas–Fort Worth.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Social media" className="text-cream/50 hover:text-cream">
                <Globe className="size-5" />
              </a>
              <a href="#" aria-label="Share" className="text-cream/50 hover:text-cream">
                <Share2 className="size-5" />
              </a>
              <a href="#" aria-label="Email" className="text-cream/50 hover:text-cream">
                <Mail className="size-5" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cream/50">
              Explore
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {explore.map((x) => (
                <li key={x.label}>
                  <Link className="text-cream/80 hover:text-cream" href={x.href}>
                    {x.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cream/50">
              Services
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {services.map((x) => (
                <li key={x.label}>
                  <Link className="text-cream/80 hover:text-cream" href={x.href}>
                    {x.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Take Action */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cream/50">
              Take Action
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {action.map((x) => (
                <li key={x.label}>
                  <Link className="text-cream/80 hover:text-cream" href={x.href}>
                    {x.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-10 rounded-2xl border border-cream/10 bg-evergreen/40 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-cream">Stay Connected</p>
              <p className="mt-1 text-sm text-cream/60">
                Get updates on upcoming groups, workshops, and nature-based OT
                resources.
              </p>
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your email"
                aria-label="Email for newsletter"
                className="min-w-0 flex-1 rounded-full border border-cream/20 bg-cream/10 px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-cream/40 focus:outline-none sm:w-56"
              />
              <button
                type="submit"
                className="rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-forest transition hover:bg-white"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-cream/10 pt-6">
          <p className="text-xs text-cream/45">
            &copy; {new Date().getFullYear()} TreeTots DFW. All rights
            reserved.
          </p>
          <div className="flex gap-4">
            {legal.map((x) => (
              <Link
                key={x.label}
                href={x.href}
                className="text-xs text-cream/45 hover:text-cream/70"
              >
                {x.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
