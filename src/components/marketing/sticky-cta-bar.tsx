"use client";

import Link from "next/link";
import { Phone, Heart, FileText } from "lucide-react";

export function StickyCTABar() {
  return (
    <nav
      aria-label="Quick actions"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-forest/15 bg-white/90 shadow-[0_-2px_16px_rgba(22,63,42,0.08)] backdrop-blur-md supports-[backdrop-filter]:bg-white/85"
    >
      {/* Desktop */}
      <div className="mx-auto hidden max-w-7xl items-center justify-between px-4 py-2 md:flex lg:px-6">
        <div className="flex items-center gap-2">
          <Link
            href="/waitlist"
            className="inline-flex min-h-9 items-center justify-center rounded-full bg-forest px-5 text-sm font-semibold text-cream transition hover:bg-forest/90"
          >
            Join the Waitlist
          </Link>
          <Link
            href="/book-call"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-forest/20 px-5 text-sm font-semibold text-forest transition hover:bg-cream/60"
          >
            <Phone className="size-3.5" aria-hidden />
            Book a Parent Call
          </Link>
          <Link
            href="/provider-referral"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-forest/20 px-5 text-sm font-semibold text-forest transition hover:bg-cream/60"
          >
            <Heart className="size-3.5" aria-hidden />
            Refer a Child
          </Link>
          <Link
            href="/referral-partners#request-packet"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-forest/20 px-5 text-sm font-semibold text-forest transition hover:bg-cream/60"
          >
            <FileText className="size-3.5" aria-hidden />
            Request Partner Packet
          </Link>
        </div>
        <div className="text-xs font-medium uppercase tracking-wide text-forest/40">
          TreeTots DFW
        </div>
      </div>

      {/* Mobile */}
      <div className="flex items-center justify-center gap-2 px-3 py-2 md:hidden">
        <Link
          href="/waitlist"
          className="inline-flex min-h-9 flex-1 items-center justify-center rounded-full bg-forest px-4 text-sm font-semibold text-cream"
        >
          Join Waitlist
        </Link>
        <Link
          href="/book-call"
          className="inline-flex min-h-9 flex-1 items-center justify-center rounded-full border border-forest/20 px-4 text-sm font-semibold text-forest"
        >
          Book Call
        </Link>
      </div>
    </nav>
  );
}
