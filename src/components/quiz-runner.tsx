"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { QUIZ_DISCLAIMER_SHORT, QUIZ_QUESTIONS } from "@/lib/quiz-data";
import { scoreQuiz } from "@/lib/scoring";
import { selectableChoiceClass } from "@/lib/selectable-choice";

const STORAGE_KEY = "tnq_quiz_v1";

export function QuizRunner() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const q = QUIZ_QUESTIONS[idx];
  const progress = useMemo(
    () => Math.round(((idx + 1) / QUIZ_QUESTIONS.length) * 100),
    [idx]
  );

  function select(value: number) {
    if (!q) return;
    setAnswers((a) => ({ ...a, [q.id]: value }));
  }

  function next() {
    if (current === undefined) return;
    if (idx < QUIZ_QUESTIONS.length - 1) {
      setIdx((i) => i + 1);
    } else {
      const sessionId = nanoid();
      const merged = { ...answers, [q.id]: current };
      const { scores, primary } = scoreQuiz(merged);
      const payload = {
        sessionId,
        answers: merged,
        scores,
        primary,
        completedAt: new Date().toISOString(),
      };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // ignore
      }
      router.push("/results");
    }
  }

  function back() {
    if (idx > 0) setIdx((i) => i - 1);
  }

  if (!q) return null;
  const current = answers[q.id];

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <p className="rounded-2xl border border-sage/20 bg-white/60 p-4 text-sm text-bark/90">
        {QUIZ_DISCLAIMER_SHORT}
      </p>
      <div>
        <p className="text-sm font-medium text-moss" aria-live="polite">
          Question {idx + 1} of {QUIZ_QUESTIONS.length} · {progress}%
        </p>
        <div
          className="mt-2 h-3 overflow-hidden rounded-full bg-sand"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-moss transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-forest sm:text-3xl">
        {q.prompt}
      </h1>
      <div className="grid gap-3">
        {q.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={current === opt.value}
            onClick={() => select(opt.value)}
            className={selectableChoiceClass(current === opt.value, "card")}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={back}
          disabled={idx === 0}
          className="min-h-12 min-w-[8rem] rounded-full border border-sage/40 px-6 text-moss disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={current === undefined}
          className="min-h-12 min-w-[10rem] rounded-full bg-sage px-6 font-medium text-cream shadow hover:bg-forest disabled:opacity-40"
        >
          {idx === QUIZ_QUESTIONS.length - 1 ? "See results" : "Continue"}
        </button>
      </div>
    </div>
  );
}
