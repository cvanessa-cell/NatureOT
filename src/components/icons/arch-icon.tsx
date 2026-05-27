import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

const ArchIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ color = "currentColor", size = 24, strokeWidth = 2, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M4 21V11a8 8 0 0 1 16 0v10" />
      <path d="M4 21h16" />
    </svg>
  ),
);

ArchIcon.displayName = "ArchIcon";

export { ArchIcon };
