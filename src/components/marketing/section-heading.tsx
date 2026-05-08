import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl space-y-3",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="text-sm font-medium uppercase tracking-wide text-sage">
          {eyebrow}
        </p>
      )}
      <h2 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold leading-tight text-forest sm:text-4xl">
        {title}
      </h2>
      {description && (
        <div className="text-lg text-bark/90">{description}</div>
      )}
    </div>
  );
}
