import type { ResultCategory } from "@/types/database";
import { QUIZ_QUESTIONS } from "@/lib/quiz-data";

const categories: ResultCategory[] = [
  "sensory_regulation",
  "motor_coordination",
  "attention_executive",
  "social_participation",
  "school_readiness",
  "emotional_regulation",
  "outdoor_confidence",
];

export function scoreQuiz(
  answers: Record<string, number>
): {
  scores: Record<ResultCategory, number>;
  primary: ResultCategory;
} {
  const scores = Object.fromEntries(
    categories.map((c) => [c, 0])
  ) as Record<ResultCategory, number>;

  for (const q of QUIZ_QUESTIONS) {
    const v = answers[q.id];
    if (typeof v === "number") scores[q.category] += v;
  }

  let primary: ResultCategory = "sensory_regulation";
  let max = -1;
  for (const c of categories) {
    if (scores[c] > max) {
      max = scores[c];
      primary = c;
    }
  }
  return { scores, primary };
}
