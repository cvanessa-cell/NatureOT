import { QuizRunner } from "@/components/quiz-runner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parent guide | Texas Nature OT",
  description:
    "Educational parent guide about everyday skills. Not a clinical assessment.",
};

export default function QuizPage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 pt-10 text-center">
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-forest sm:text-4xl">
          A short parent guide
        </h1>
        <p className="mt-3 text-bark/90">
          For each question, pick the option that best matches the past few
          weeks. This is a general reflection, not a test and not a diagnosis.
        </p>
      </div>
      <QuizRunner />
    </div>
  );
}
