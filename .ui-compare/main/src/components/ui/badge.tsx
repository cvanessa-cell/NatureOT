import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "sage"
  | "sky"
  | "sand"
  | "terracotta"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

const tones: Record<BadgeTone, string> = {
  sage: "bg-sage/15 text-forest border-sage/25",
  sky: "bg-sky/15 text-forest border-sky/30",
  sand: "bg-sand/80 text-bark border-sand",
  terracotta: "bg-terracotta/12 text-terracotta border-terracotta/25",
  success: "bg-moss/15 text-forest border-moss/30",
  warning: "bg-amber-100 text-amber-950 border-amber-200",
  danger: "bg-red-100 text-red-900 border-red-200",
  neutral: "bg-white/80 text-bark border-sand",
};

export function Badge({
  className,
  tone = "sage",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
