"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/waitlist", label: "Waitlist" },
  { href: "/admin/groups", label: "Groups" },
  { href: "/admin/workshops", label: "Workshops" },
  { href: "/admin/referral-partners", label: "Partners" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/local-seo", label: "Local SEO" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/campaign-policy", label: "Policy" },
  { href: "/admin/airtable", label: "Airtable" },
  { href: "/admin/zapier", label: "Zapier" },
  { href: "/admin/agent-airtable", label: "Agent" },
  { href: "/admin/sequences", label: "Sequences" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/settings/launch-readiness", label: "Launch" },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 bg-forest px-4 py-3 md:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin" className="font-[family-name:var(--font-fraunces)] text-lg text-cream">
          Admin
        </Link>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 text-cream"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
          <span className="sr-only">Menu</span>
        </button>
      </div>
      {open && (
        <ul className="mt-3 space-y-1 border-t border-white/10 pt-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium",
                  pathname === l.href || pathname.startsWith(l.href + "/")
                    ? "bg-cream/15 text-cream"
                    : "text-cream/85"
                )}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 text-sm text-cream/80"
              onClick={() => setOpen(false)}
            >
              Public site
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
