import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";

export function ComplianceBanner({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border border-sage/25 bg-cream/90 p-4 text-sm text-bark",
        className
      )}
      role="note"
    >
      <ShieldAlert className="mt-0.5 size-5 shrink-0 text-sage" aria-hidden />
      <div className="space-y-1 leading-relaxed">{children}</div>
    </div>
  );
}
