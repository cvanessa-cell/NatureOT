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
import { ArchIcon } from "@/components/icons/arch-icon";
import { ShirtIcon } from "@/components/icons/shirt-icon";

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
  Arch: ArchIcon as unknown as LucideIcon,
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
  Puzzle: ArchIcon as unknown as LucideIcon,
  Shirt: ShirtIcon as unknown as LucideIcon,
};

export function resolveIcon(name: string | undefined | null): LucideIcon {
  if (!name) return HelpCircle;
  return iconLookup[name] ?? HelpCircle;
}
