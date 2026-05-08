"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/groups", label: "Groups" },
  { href: "/workshops", label: "Workshops" },
  { href: "/parent-guide", label: "Parent Guide" },
  { href: "/referral-partners", label: "Referral Partners" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-sand/80 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-forest sm:text-xl"
        >
          Nature OT Growth OS
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main"
        >
          {links.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium text-bark/90 transition hover:bg-sand/60 hover:text-forest",
                pathname === n.href && "bg-sand/70 text-forest"
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/waitlist"
            className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-sage/40 bg-white/80 px-4 text-sm font-medium text-forest transition hover:border-sage hover:bg-cream/60"
          >
            Join the Waitlist
          </Link>
          <Link
            href="/book-call"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-4 text-sm font-medium text-cream shadow-sm transition hover:bg-sage"
          >
            Book a Parent Call
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-sand bg-white/80 text-forest lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-sand/80 bg-cream/98 px-4 py-4 lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-medium text-forest hover:bg-sand/60"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/quiz"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-base font-medium text-forest hover:bg-sand/60"
            >
              Interactive parent guide (quiz)
            </Link>
            <div className="mt-4 flex flex-col gap-2 border-t border-sand pt-4">
              <Link
                href="/waitlist"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-sage/40 bg-white/80 px-4 text-center font-medium text-forest"
              >
                Join the Waitlist
              </Link>
              <Link
                href="/book-call"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-4 text-center font-medium text-cream"
              >
                Book a Parent Call
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
