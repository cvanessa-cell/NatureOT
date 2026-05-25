"use client";

import Link from "next/link";
import { Phone, Heart, FileText } from "lucide-react";

export function StickyCTABar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-evergreen bg-forest/95 backdrop-blur supports-[backdrop-filter]:bg-forest/90">
      {/* Desktop */}
      <div className="mx-auto hidden max-w-7xl items-center justify-between px-4 py-2.5 md:flex lg:px-6">
        <div className="flex items-center gap-2">
          <Link
            href="/waitlist"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-cream px-5 text-sm font-semibold text-forest transition hover:bg-white"
          >
            Join the Waitlist
          </Link>
          <Link
            href="/book-call"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-cream/30 px-5 text-sm font-semibold text-cream transition hover:bg-cream/10"
          >
            <Phone className="size-3.5" aria-hidden />
            Book a Parent Call
          </Link>
          <Link
            href="/provider-referral"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-cream/30 px-5 text-sm font-semibold text-cream transition hover:bg-cream/10"
          >
            <Heart className="size-3.5" aria-hidden />
            Refer a Child
          </Link>
          <Link
            href="/referral-partners#request-packet"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-cream/30 px-5 text-sm font-semibold text-cream transition hover:bg-cream/10"
          >
            <FileText className="size-3.5" aria-hidden />
            Request Partner Packet
          </Link>
        </div>
        <div className="text-xs font-medium uppercase tracking-wide text-cream/60">
          TreeTots DFW
        </div>
      </div>

      {/* Mobile */}
      <div className="flex items-center justify-center gap-2 px-3 py-2.5 md:hidden">
        <Link
          href="/waitlist"
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full bg-cream px-4 text-sm font-semibold text-forest"
        >
          Join Waitlist
        </Link>
        <Link
          href="/book-call"
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-full border border-cream/30 px-4 text-sm font-semibold text-cream"
        >
          Book Call
        </Link>
        <Link
          href="/provider-referral"
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-cream/30 px-4 text-sm font-semibold text-cream"
        >
          Refer
        </Link>
      </div>
    </div>
  );
}
