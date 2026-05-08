import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "min-h-12 w-full rounded-xl border border-sand bg-white px-4 text-forest shadow-inner shadow-black/5 placeholder:text-bark/50 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[120px] w-full rounded-xl border border-sand bg-white px-4 py-3 text-forest shadow-inner shadow-black/5 placeholder:text-bark/50 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
