import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "terracotta"
  | "gold"
  | "clay";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-forest text-cream shadow-sm hover:bg-forest/90 focus-visible:ring-2 focus-visible:ring-forest/40",
  secondary:
    "bg-sky/90 text-cream shadow-sm hover:bg-sky focus-visible:ring-2 focus-visible:ring-sky/50",
  outline:
    "border-2 border-forest/30 bg-white/80 text-forest hover:border-forest/50 hover:bg-cream/60",
  ghost: "text-forest hover:bg-sand/60",
  terracotta:
    "bg-terracotta text-cream shadow-sm hover:opacity-95 focus-visible:ring-2 focus-visible:ring-terracotta/40",
  gold: "bg-gold text-white shadow-sm hover:bg-gold/90 focus-visible:ring-2 focus-visible:ring-gold/40",
  clay: "bg-terracotta text-white shadow-sm hover:bg-terracotta/90 focus-visible:ring-2 focus-visible:ring-terracotta/40",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
  }
>(({ className, variant = "primary", type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-40",
      variants[variant],
      className,
    )}
    {...props}
  />
));
Button.displayName = "Button";
