import type { LucideIcon } from "lucide-react";
import {
  Leaf,
  Heart,
  Users,
  ShieldCheck,
  Calendar,
  MapPin,
  Sprout,
  Smile,
  Brain,
  Footprints,
  Star,
  FileText,
  Phone,
  HandHeart,
  TreePine,
  Sparkles,
  Eye,
  Activity,
  Compass,
  CircleUserRound,
  GraduationCap,
  Home,
  Sun,
  Wind,
  Mountain,
  Puzzle,
  CloudLightning,
  Shield,
  Repeat,
} from "lucide-react";

export interface HeroBenefit {
  icon: LucideIcon;
  label: string;
}

export const heroBenefits: HeroBenefit[] = [
  { icon: ShieldCheck, label: "Build Confidence" },
  { icon: Brain, label: "Improve Regulation" },
  { icon: Activity, label: "Strengthen Skills" },
  { icon: Users, label: "Create Connection" },
];

export const trustCardItems = [
  "Evidence-Based",
  "Play-Based",
  "Child-Led",
  "Nature-Focused",
];

export interface TrustStat {
  icon: LucideIcon;
  value: string;
  label: string;
}

export const trustStats: TrustStat[] = [
  { icon: Calendar, value: "12+", label: "Years of Experience" },
  { icon: Heart, value: "100+", label: "Families Served" },
  { icon: Users, value: "Small", label: "Groups for Big Impact" },
  { icon: MapPin, value: "DFW", label: "Local & Community Focused" },
];

export interface ConcernItem {
  icon: LucideIcon;
  label: string;
}

export const concerns: ConcernItem[] = [
  { icon: Sparkles, label: "Sensory Overwhelm" },
  { icon: Footprints, label: "Poor Coordination or Clumsiness" },
  { icon: CloudLightning, label: "Big Emotions & Meltdowns" },
  { icon: Users, label: "Social Skills & Friendships" },
  { icon: Shield, label: "Low Confidence or Risk-Avoidance" },
  { icon: Repeat, label: "Difficulty with Transitions" },
];

export interface ValuePillar {
  icon: LucideIcon;
  label: string;
}

export const valuePillars: ValuePillar[] = [
  { icon: HandHeart, label: "OT-Led & Family-Centered" },
  { icon: TreePine, label: "Outdoors in Nature" },
  { icon: ShieldCheck, label: "Evidence-Based & Play-Based" },
  { icon: Users, label: "Small Group Support" },
  { icon: MapPin, label: "DFW Local & Community Focused" },
];

export interface ServiceItem {
  title: string;
  description: string;
  icon: LucideIcon;
  cta: string;
  href: string;
}

export const services: ServiceItem[] = [
  {
    title: "Nature OT Groups",
    description:
      "Weekly small-group occupational therapy sessions that support regulation, motor confidence, social participation, and everyday skills through guided nature-based play.",
    icon: Leaf,
    cta: "Learn More",
    href: "/groups",
  },
  {
    title: "Individual OT",
    description:
      "Personalized sessions designed around your child's goals, strengths, sensory needs, and daily routines.",
    icon: CircleUserRound,
    cta: "Learn More",
    href: "/about",
  },
  {
    title: "Summer Camps",
    description:
      "Fun, outdoor camps that build confidence, friendships, resilience, and independence.",
    icon: Sun,
    cta: "Learn More",
    href: "/groups",
  },
  {
    title: "Parent Workshops",
    description:
      "Practical strategies to support your child at home, outdoors, and beyond.",
    icon: GraduationCap,
    cta: "Learn More",
    href: "/workshops",
  },
];

export interface GroupOffering {
  name: string;
  ageRange: string;
  schedule: string;
  location: string;
  status: "enrolling" | "waitlist";
}

export const upcomingGroups: GroupOffering[] = [
  {
    name: "Spring OT Group (Ages 5–7)",
    ageRange: "Ages 5–7",
    schedule: "Tuesdays | April 28 – June 11",
    location: "White Rock Lake, Dallas",
    status: "waitlist",
  },
  {
    name: "Social Skills & Confidence (Ages 8–10)",
    ageRange: "Ages 8–10",
    schedule: "Thursdays | May 2 – June 13",
    location: "Frisco Commons Park",
    status: "waitlist",
  },
  {
    name: "Homeschool Nature OT (Ages 6–9)",
    ageRange: "Ages 6–9",
    schedule: "Wednesdays | May 1 – June 12",
    location: "Arbor Hills Nature Preserve, Plano",
    status: "enrolling",
  },
];

export const whyChooseUs = [
  "Experienced Pediatric OT",
  "Nature-Based & Evidence-Informed",
  "Small Group Sizes",
  "Family Collaboration",
  "Progress Updates",
  "Safe, Supportive Environment",
];

export interface TestimonialItem {
  quote: string;
  author: string;
  location: string;
}

export const testimonials: TestimonialItem[] = [
  {
    quote:
      "My child is more confident, better regulated, and actually asks to go outside now.",
    author: "A.P.",
    location: "Plano, TX",
  },
  {
    quote:
      "The group was the highlight of our week. My daughter has grown so much socially and emotionally.",
    author: "M.K.",
    location: "Frisco, TX",
  },
  {
    quote:
      "A perfect blend of play and therapy. We saw progress we hadn't seen before.",
    author: "J.T.",
    location: "McKinney, TX",
  },
];

export interface WhyNatureItem {
  icon: LucideIcon;
  label: string;
}

export const whyNatureItems: WhyNatureItem[] = [
  { icon: Brain, label: "Improve Sensory Processing" },
  { icon: Eye, label: "Increase Focus & Attention" },
  { icon: Heart, label: "Build Emotional Regulation" },
  { icon: Mountain, label: "Boost Confidence & Resilience" },
  { icon: Activity, label: "Enhance Motor Skills" },
  { icon: Users, label: "Support Social Connection" },
];

export const providerBullets = [
  "Easy referrals",
  "School and clinic partnerships",
  "Staff development",
  "Parent education",
  "Community events",
];

export const serviceAreas = [
  "Dallas",
  "Plano",
  "Frisco",
  "McKinney",
  "Allen",
  "Richardson",
  "Garland",
  "Southlake",
  "Collin County",
];

export interface FaqEntry {
  id: string;
  q: string;
  a: string;
}

export const faqItems: FaqEntry[] = [
  {
    id: "what-is",
    q: "What is nature-based occupational therapy?",
    a: "Nature-based occupational therapy is therapist-led, goal-directed, play-based OT delivered in outdoor and natural environments. It uses movement, sensory-rich experiences, social play, and meaningful real-world activities to support a child's development.",
  },
  {
    id: "vs-play",
    q: "Is this the same as outdoor play?",
    a: "No. While outdoor play is wonderful, nature-based OT is led by a licensed occupational therapist with specific therapeutic goals, structured activities, and ongoing assessment. It's real therapy in a natural setting.",
  },
  {
    id: "good-fit",
    q: "Who is a good fit for nature-based OT groups?",
    a: "Children ages 4–12 who may benefit from support with sensory regulation, motor coordination, social participation, emotional regulation, or building confidence in outdoor settings. We help families determine fit during a parent call.",
  },
  {
    id: "skills",
    q: "What skills can nature-based OT support?",
    a: "Nature-based OT can support sensory processing, motor planning and coordination, emotional regulation, social skills, confidence, problem-solving, and functional independence in everyday activities.",
  },
  {
    id: "individual",
    q: "Do you offer individual sessions?",
    a: "Yes. We offer personalized individual OT sessions designed around your child's unique goals, strengths, and sensory needs. Contact us to learn more about availability.",
  },
  {
    id: "how-groups",
    q: "How do groups work?",
    a: "Groups are small (typically 4–6 children), led by a licensed OT, and meet weekly at local outdoor locations across DFW. Each session includes structured therapeutic activities with clear goals while keeping it fun and engaging.",
  },
  {
    id: "weather",
    q: "What happens if the weather is bad?",
    a: "We monitor weather closely and have backup plans for inclement conditions. In some cases sessions may be rescheduled. Safety is always our top priority.",
  },
  {
    id: "providers",
    q: "Do you work with schools or providers?",
    a: "Absolutely. We partner with pediatricians, therapists, schools, ABA clinics, homeschool communities, and other professionals who support children and families. We make referrals easy.",
  },
  {
    id: "waitlist",
    q: "How do I join the waitlist?",
    a: "Click the 'Join the Waitlist' button anywhere on this page, fill out a brief form, and we'll be in touch with next steps and availability for upcoming groups.",
  },
];

export const contactInterestOptions = [
  "Nature OT Groups",
  "Individual OT",
  "Summer Camps",
  "Parent Workshop",
  "Provider Referral",
  "Not Sure Yet",
];

export const explainerBullets = [
  "Supports sensory regulation",
  "Builds motor planning and coordination",
  "Encourages confidence and resilience",
  "Creates opportunities for social participation",
  "Helps children practice real-life functional skills",
  "Gives parents strategies for carryover at home and in the community",
];

export const navLinks = [
  { href: "/about", label: "About" },
  { href: "/groups", label: "Services", hasDropdown: true },
  { href: "/groups", label: "Groups", hasDropdown: true },
  { href: "/parent-guide", label: "For Parents" },
  { href: "/referral-partners", label: "For Providers" },
  { href: "/faq", label: "Resources" },
  { href: "/get-started", label: "Contact" },
];
