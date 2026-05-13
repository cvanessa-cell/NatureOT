import type { LucideIcon } from "lucide-react";
import {
  Leaf,
  Heart,
  Users,
  ShieldCheck,
  Calendar,
  MapPin,
  Brain,
  Footprints,
  Activity,
  Eye,
  Wind,
  Mountain,
  Puzzle,
  Sparkles,
  HandHeart,
  TreePine,
  CircleUserRound,
  GraduationCap,
  Sun,
  Compass,
  HelpCircle,
  CloudLightning,
  Shield,
  Repeat,
} from "lucide-react";

const iconLookup: Record<string, LucideIcon> = {
  Leaf,
  Heart,
  Users,
  ShieldCheck,
  Calendar,
  MapPin,
  Brain,
  Footprints,
  Activity,
  Eye,
  Wind,
  Mountain,
  Puzzle,
  Sparkles,
  HandHeart,
  TreePine,
  CircleUserRound,
  GraduationCap,
  Sun,
  Compass,
  CloudLightning,
  Shield,
  Repeat,
  ShieldHeart: Shield,
};

export function resolveIcon(name: string | undefined | null): LucideIcon {
  if (!name) return HelpCircle;
  return iconLookup[name] ?? HelpCircle;
}
