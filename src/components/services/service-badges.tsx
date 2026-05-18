import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { ServiceBadge } from "@/lib/services-catalog";

const BADGE_TONES: Record<ServiceBadge, BadgeTone> = {
  "Play-Based": "sage",
  "Therapist-Led": "sky",
  "Virtual Intensive": "warning",
  "Best for Social Play": "terracotta",
  "Best for Regulation Support": "success",
  "At-Home Program": "sand",
  "Outdoor Play": "sky",
};

export function ServiceBadges({ badges }: { badges: ServiceBadge[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <Badge key={badge} tone={BADGE_TONES[badge] ?? "neutral"}>
          {badge}
        </Badge>
      ))}
    </div>
  );
}
