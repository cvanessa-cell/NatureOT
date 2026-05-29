"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackMembershipEvent } from "@/lib/analytics/membership-events";
import { cn } from "@/lib/cn";

export function MembershipFitCallLink({
  href = "/book-call?service=membership",
  children,
  className,
}: {
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={() => trackMembershipEvent("membership_fit_call_click")}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-full border-2 border-forest/25 bg-white px-7 text-sm font-semibold text-forest transition hover:bg-cream/60",
        className,
      )}
    >
      {children}
    </Link>
  );
}
