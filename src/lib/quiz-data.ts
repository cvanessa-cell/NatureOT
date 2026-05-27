import type { QuizQuestion, ResultCategory } from "@/types/database";

const scale = [
  { label: "Not at all / rarely", value: 0 },
  { label: "Sometimes", value: 1 },
  { label: "Often", value: 2 },
  { label: "Almost always / very much", value: 3 },
];

function q(
  id: string,
  category: ResultCategory,
  prompt: string
): QuizQuestion {
  return { id, category, prompt, options: scale };
}

/** Educational parent guide — not a clinical assessment. */
export const QUIZ_DISCLAIMER_SHORT =
  "This guide is for educational purposes only. It is not an occupational therapy evaluation and does not diagnose any condition.";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  q("sr1", "sensory_regulation", "My child seems overwhelmed by noise, clothing, or busy places."),
  q("sr2", "sensory_regulation", "My child seeks a lot of movement, touch, or intense input to feel settled."),
  q("mc1", "motor_coordination", "My child tires easily with motor tasks or seems awkward with sports or playground skills."),
  q("mc2", "motor_coordination", "My child has difficulty with balance, stairs, or coordinating both sides of the body."),
  q("ae1", "attention_executive", "My child has trouble starting tasks, shifting attention, or finishing what they begin."),
  q("ae2", "attention_executive", "My child struggles with organization of belongings, time, or multi-step directions."),
  q("sp1", "social_participation", "My child finds it hard to join peers or keep interactions going."),
  q("sp2", "social_participation", "My child becomes overwhelmed in group settings or needs extra support to participate."),
  q("sch1", "school_readiness", "We worry about readiness skills like fine motor tools, sitting for learning, or following group routines."),
  q("sch2", "school_readiness", "Transitions to school-like routines (circle time, lining up, table work) feel difficult."),
  q("er1", "emotional_regulation", "My child has big feelings that are hard to recover from after stress or disappointment."),
  q("er2", "emotional_regulation", "My child needs a lot of support to stay regulated during demands or changes."),
  q("oc1", "outdoor_confidence", "My child hesitates with uneven ground, climbing, or exploring outdoor spaces."),
  q("oc2", "outdoor_confidence", "We would like more confidence with weather changes, textures, or nature settings."),
];

export const CATEGORY_LABELS: Record<ResultCategory, string> = {
  sensory_regulation: "Sensory regulation",
  motor_coordination: "Motor coordination",
  attention_executive: "Attention & executive functioning",
  social_participation: "Social participation",
  school_readiness: "School readiness",
  emotional_regulation: "Emotional regulation",
  outdoor_confidence: "Outdoor confidence",
};

export const CATEGORY_SUMMARIES: Record<
  ResultCategory,
  { title: string; body: string[] }
> = {
  sensory_regulation: {
    title: "Sensory regulation stood out in your responses",
    body: [
      "Many families notice differences in how children take in and respond to sensory information from the world around them.",
      "Nature-based, therapist-led groups can offer paced transitions and outdoor sensory experiences in a supportive small-group setting. Individual results vary; we do not promise specific outcomes.",
    ],
  },
  motor_coordination: {
    title: "Motor coordination themes appeared in your responses",
    body: [
      "Outdoor play offers natural opportunities for balance, strength, and coordination practice in motivating contexts.",
      "Our groups focus on safe, developmentally thoughtful activities guided by licensed occupational therapy practitioners. This quiz does not replace an in-person assessment.",
    ],
  },
  attention_executive: {
    title: "Attention and executive skills were frequently noted",
    body: [
      "Starting tasks, shifting attention, and organizing steps are common focus areas for elementary-age children.",
      "We structure outdoor sessions to build routines that support attention within play—not as a guarantee of school performance.",
    ],
  },
  social_participation: {
    title: "Social participation was a prominent theme",
    body: [
      "Small groups can help children practice communication and collaboration with peer support and adult facilitation.",
      "We emphasize inclusion and pacing so children can participate at their level on a given day.",
    ],
  },
  school_readiness: {
    title: "School readiness concerns showed up in your answers",
    body: [
      "Readiness includes fine motor tools, self-care, and routines—not only academics.",
      "Our programming is educational enrichment and group occupational therapy services where clinically appropriate; we do not replace school evaluations.",
    ],
  },
  emotional_regulation: {
    title: "Emotional regulation was highlighted",
    body: [
      "Big feelings are common, especially when demands stack up. Outdoor environments can support regulation for many children.",
      "We provide coaching and co-regulation strategies during sessions. This guide cannot determine clinical needs.",
    ],
  },
  outdoor_confidence: {
    title: "Outdoor confidence emerged as a focus area",
    body: [
      "Exploring trails, grass, and gross motor challenges can build comfort over time with supportive repetition.",
      "We meet children where they are and progress gradually. Comfort levels change week to week.",
    ],
  },
};

export type RecommendedPathway = {
  name: string;
  href: string;
  reason: string;
};

export const CATEGORY_PATHWAYS: Record<ResultCategory, RecommendedPathway[]> = {
  sensory_regulation: [
    { name: "Nature-Based OT Groups", href: "/services", reason: "Therapist-led sessions designed to support sensory regulation through outdoor experiences" },
    { name: "Nature Play Groups", href: "/groups", reason: "Outdoor play with paced transitions and natural sensory input" },
    { name: "Parent Workshops", href: "/services", reason: "Practical strategies parents may use at home to support sensory needs" },
  ],
  motor_coordination: [
    { name: "Nature Play Groups", href: "/groups", reason: "Natural playground challenges that may support coordination and balance" },
    { name: "Nature-Based OT Groups", href: "/services", reason: "Therapist-guided motor activities in motivating outdoor contexts" },
    { name: "Reflex Integration Intensive", href: "/services", reason: "A focused program that may support foundational movement patterns" },
  ],
  attention_executive: [
    { name: "Nature-Based OT Groups", href: "/services", reason: "Structured outdoor sessions designed to build attention routines within play" },
    { name: "Homeschool Weekday Groups", href: "/groups", reason: "Weekday programming that may support executive functioning through nature activities" },
  ],
  social_participation: [
    { name: "Nature Play Groups", href: "/groups", reason: "Small-group play designed to support peer connection and collaboration" },
    { name: "Nature-Based OT Groups", href: "/services", reason: "Facilitated group activities that may build social confidence" },
  ],
  school_readiness: [
    { name: "Homeschool Weekday Groups", href: "/groups", reason: "Programming designed to support readiness skills like fine motor tools and group routines" },
    { name: "Nature-Based OT Groups", href: "/services", reason: "Therapist-led groups that may support transition and table-work readiness" },
    { name: "Parent Workshops", href: "/services", reason: "Resources parents may use to support readiness at home" },
  ],
  emotional_regulation: [
    { name: "Nature-Based OT Groups", href: "/services", reason: "Co-regulation strategies and calming outdoor environments" },
    { name: "Parent Workshops", href: "/services", reason: "Coaching and co-regulation approaches for home and community settings" },
    { name: "Book a Parent Call", href: "/book-call", reason: "Discuss whether individualized support could be a fit" },
  ],
  outdoor_confidence: [
    { name: "Nature Play Groups", href: "/groups", reason: "Gradual exposure to trails, textures, and outdoor challenges in a supportive setting" },
    { name: "Nature-Based OT Groups", href: "/services", reason: "Therapist-paced outdoor exploration for children who need extra support" },
  ],
};

export const CATEGORY_ICONS: Record<ResultCategory, string> = {
  sensory_regulation: "Ear",
  motor_coordination: "Activity",
  attention_executive: "Focus",
  social_participation: "Users",
  school_readiness: "GraduationCap",
  emotional_regulation: "Heart",
  outdoor_confidence: "TreePine",
};
