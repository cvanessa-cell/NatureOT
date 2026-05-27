import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

const ShirtIcon = forwardRef<SVGSVGElement, LucideProps>(
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
      {/* Shirt outline: collar notch to body */}
      <path d="M10 2 8 4 4 3v6l3 1v12h10V10l3-1V3l-4 1-2-2" />
      {/* Collar V */}
      <path d="M10 2c.6.9 1.2 1.5 2 2 .8-.5 1.4-1.1 2-2" />
      {/* Placket center line */}
      <line x1="12" y1="4" x2="12" y2="22" />
      {/* Button 1 — buttoned (filled dot) */}
      <circle cx="12" cy="8" r="0.8" fill={color} stroke="none" />
      {/* Button 2 — buttoned (filled dot) */}
      <circle cx="12" cy="12.5" r="0.8" fill={color} stroke="none" />
      {/* Button 3 — unbuttoned (open ring, offset from placket) */}
      <circle cx="13.8" cy="17.5" r="0.8" />
    </svg>
  ),
);

ShirtIcon.displayName = "ShirtIcon";

export { ShirtIcon };
