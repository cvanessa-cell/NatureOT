"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export type FaqItem = { id: string; q: string; a: string };

export function FaqAccordion({
  items,
  className,
}: {
  items: FaqItem[];
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-sand rounded-2xl border border-sand bg-card/95", className)}>
      {items.map((item) => (
        <details
          key={item.id}
          className="group px-4 py-1 open:bg-cream/40"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <ChevronDown className="size-5 shrink-0 text-moss transition group-open:rotate-180" aria-hidden />
          </summary>
          <p className="pb-4 text-sm leading-relaxed text-bark/90">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
