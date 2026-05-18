"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS, CATEGORY_SUMMARIES } from "@/lib/quiz-data";
import type { ResultCategory } from "@/types/database";

const STORAGE_KEY = "tnq_quiz_v1";

type Stored = {
  primary: ResultCategory;
  scores: Record<string, number>;
};

export function ResultsContent() {
  const [data, setData] = useState<Stored | null>(null);
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate results snapshot from sessionStorage */
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Stored;
        setData(p);
      }
    } catch {
      setData(null);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  if (!data) {
    return (
      <div className="rounded-2xl border border-sage/20 bg-white/70 p-8 text-center">
        <p className="text-bark">We could not find your guide results in this browser.</p>
        <Link
          href="/quiz"
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full bg-sage px-6 text-cream"
        >
          Start the parent guide
        </Link>
      </div>
    );
  }

  const summary = CATEGORY_SUMMARIES[data.primary];
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-moss/30 bg-white/80 p-8 shadow-sm">
        <p className="text-sm font-medium text-moss">Your educational theme</p>
        <h1 className="mt-2 font-display text-2xl text-forest sm:text-3xl">
          {summary.title}
        </h1>
        {summary.body.map((p) => (
          <p key={p.slice(0, 24)} className="mt-4 text-bark/90">
            {p}
          </p>
        ))}
        <p className="mt-4 text-sm text-bark/80">
          Category label for your reference:{" "}
          <strong>{CATEGORY_LABELS[data.primary]}</strong>
        </p>
      </div>
      <div className="rounded-2xl border border-sand bg-cream/50 p-6 text-sm text-bark">
        <p className="font-medium text-forest">How to read the numbers</p>
        <p className="mt-2">
          Higher scores in a column mean you selected options in that area
          more often. This is a reflection tool only; it does not measure IQ,
          development, or medical status.
        </p>
        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          {Object.entries(data.scores).map(([k, v]) => (
            <li key={k} className="flex justify-between gap-2 rounded-lg bg-white/60 px-3 py-2">
              <span>{CATEGORY_LABELS[k as ResultCategory]}</span>
              <span className="font-medium tabular-nums text-forest">{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
