"use client";

import { useEffect, useState } from "react";
import type { ResultCategory } from "@/types/database";
import { QUIZ_QUESTIONS } from "@/lib/quiz-data";
import { captureClientAttributionFromUrl, getClientAttributionPayload } from "@/lib/marketing/client-attribution";

const STORAGE_KEY = "tnq_quiz_v1";

type StoredQuiz = {
  sessionId: string;
  answers: Record<string, number>;
  scores: Record<string, number>;
  primary: ResultCategory;
};

export function LeadForm() {
  const [quiz, setQuiz] = useState<StoredQuiz | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ageRange, setAgeRange] = useState("5-7");
  const [city, setCity] = useState("");
  const [concern, setConcern] = useState("");
  const [consent, setConsent] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate quiz snapshot from sessionStorage */
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setQuiz(JSON.parse(raw) as StoredQuiz);
    } catch {
      setQuiz(null);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    captureClientAttributionFromUrl();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quiz || !privacy) return;
    setStatus("loading");
    const quizAnswers = QUIZ_QUESTIONS.map((qq) => ({
      questionId: qq.id,
      category: qq.category,
      value: quiz.answers[qq.id] ?? 0,
    }));
    const body = {
      parentName: name,
      parentEmail: email,
      parentPhone: phone || undefined,
      childAgeRange: ageRange,
      cityOrZip: city,
      mainConcern: concern,
      consentMarketing: consent,
      consentPrivacy: privacy,
      primaryCategory: quiz.primary,
      scores: quiz.scores,
      quizAnswers,
      sessionId: quiz.sessionId,
      ...getClientAttributionPayload(),
    };
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("error");
      setMessage(j.error ?? "Something went wrong");
      return;
    }
    setStatus("done");
    sessionStorage.removeItem(STORAGE_KEY);
  }

  if (!quiz) {
    return (
      <div className="rounded-2xl border border-sage/20 bg-white/70 p-6 text-bark">
        <p className="mb-4">
          Take the short parent guide first so we can personalize your summary.
        </p>
        <a
          href="/quiz"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-sage px-6 font-medium text-cream"
        >
          Start the parent guide
        </a>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-moss/30 bg-white/80 p-8 text-center">
        <h2 className="font-display text-2xl text-forest">
          Thank you
        </h2>
        <p className="mt-3 text-bark">
          Check your email for next steps. Individual responses vary; we do not
          guarantee specific outcomes.
        </p>
        <a
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-sage px-6 font-medium text-cream"
          href="/book"
        >
          Book a call
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-sage/20 bg-white/70 p-6 shadow-sm">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-forest" htmlFor="name">
          Parent or caregiver name
        </label>
        <input
          id="name"
          required
          autoComplete="name"
          className="min-h-12 rounded-xl border border-sand bg-white px-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-forest" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className="min-h-12 rounded-xl border border-sand bg-white px-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-forest" htmlFor="phone">
          Mobile phone (optional — for SMS only if you opt in)
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          className="min-h-12 rounded-xl border border-sand bg-white px-4"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1…"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-forest" htmlFor="age">
          Child age range
        </label>
        <select
          id="age"
          required
          className="min-h-12 rounded-xl border border-sand bg-white px-4"
          value={ageRange}
          onChange={(e) => setAgeRange(e.target.value)}
        >
          <option value="2-4">2–4 years</option>
          <option value="5-7">5–7 years</option>
          <option value="8-10">8–10 years</option>
          <option value="11-13">11–13 years</option>
          <option value="14+">14+ years</option>
        </select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-forest" htmlFor="city">
          City or ZIP code (Texas)
        </label>
        <input
          id="city"
          required
          className="min-h-12 rounded-xl border border-sand bg-white px-4"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-forest" htmlFor="concern">
          Main concern (general themes — avoid names or diagnoses)
        </label>
        <textarea
          id="concern"
          required
          rows={4}
          className="rounded-xl border border-sand bg-white px-4 py-3"
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          placeholder="For example: group participation, sensory needs in busy places, coordination with peers…"
        />
      </div>
      <label className="flex cursor-pointer gap-3 rounded-xl border border-sand bg-cream/40 p-4">
        <input
          type="checkbox"
          className="mt-1 size-5"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span className="text-sm text-bark">
          I agree to receive informational emails and optional text messages about
          programs and scheduling. Message and data rates may apply. I can
          unsubscribe anytime (links are included in messages).
        </span>
      </label>
      <label className="flex cursor-pointer gap-3 rounded-xl border border-sand bg-cream/40 p-4">
        <input
          type="checkbox"
          required
          className="mt-1 size-5"
          checked={privacy}
          onChange={(e) => setPrivacy(e.target.checked)}
        />
        <span className="text-sm text-bark">
          I have read the{" "}
          <a href="/privacy" className="underline">
            privacy policy
          </a>{" "}
          and understand how information is used.
        </span>
      </label>
      {status === "error" && (
        <p className="text-sm text-red-800" role="alert">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading" || !privacy}
        className="min-h-14 w-full rounded-full bg-forest font-medium text-cream hover:bg-sage disabled:opacity-40"
      >
        {status === "loading" ? "Sending…" : "Send my summary"}
      </button>
    </form>
  );
}
