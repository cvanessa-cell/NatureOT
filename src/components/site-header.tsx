"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Leaf } from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/groups", label: "Groups" },
  { href: "/parent-guide", label: "For Parents" },
  { href: "/referral-partners", label: "For Providers" },
  { href: "/faq", label: "FAQ" },
  { href: "/get-started", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [navReady, setNavReady] = useState(false);

  useEffect(() => {
    setNavReady(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-sand/60 bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/85">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-full bg-forest text-cream">
            <Leaf className="size-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-forest">
            TreeTots <span className="text-moss">DFW</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {links.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className={cn(
                "rounded-full px-3 py-2 text-[0.9rem] font-medium text-forest/80 transition hover:bg-sage/40 hover:text-forest",
                navReady && pathname === n.href && "bg-sage/30 text-forest",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/book-call"
            className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-forest/20 bg-white/80 px-5 text-sm font-semibold text-forest transition hover:border-forest/35 hover:bg-white"
          >
            Book a Call
          </Link>
          <Link
            href="/waitlist"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-5 text-sm font-semibold text-cream shadow-sm transition hover:bg-forest/90"
          >
            Join the Waitlist
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
          className="border-t border-sand/60 bg-ivory px-4 py-4 lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-medium text-forest hover:bg-sage/30"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-sand pt-4">
              <Link
                href="/waitlist"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-6 text-center font-semibold text-cream"
              >
                Join the Waitlist
              </Link>
              <Link
                href="/book-call"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-forest/30 bg-white px-6 text-center font-semibold text-forest"
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
