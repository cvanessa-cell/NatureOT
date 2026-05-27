"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CATEGORY_LABELS,
  CATEGORY_SUMMARIES,
  CATEGORY_PATHWAYS,
  QUIZ_DISCLAIMER_SHORT,
} from "@/lib/quiz-data";
import type { ResultCategory } from "@/types/database";
import {
  Leaf,
  Printer,
  Copy,
  Check,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Phone,
  ClipboardList,
  Eye,
  Mail,
  TreePine,
} from "lucide-react";

const SESSION_KEY = "tnq_quiz_v1";
const LOCAL_KEY = "tnq_quiz_v1_local";

type Stored = {
  sessionId?: string;
  primary: ResultCategory;
  scores: Record<string, number>;
  completedAt?: string;
};

/* ---------- helpers ---------- */

function loadStoredResult(urlId: string | null): Stored | null {
  try {
    const sessionRaw = sessionStorage.getItem(SESSION_KEY);
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw) as Stored;
      if (!urlId || parsed.sessionId === urlId) return parsed;
    }
  } catch {
    /* ignore */
  }
  try {
    const localRaw = localStorage.getItem(LOCAL_KEY);
    if (localRaw) {
      const parsed = JSON.parse(localRaw) as Stored;
      if (!urlId || parsed.sessionId === urlId) return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

const allCategories: ResultCategory[] = [
  "sensory_regulation",
  "motor_coordination",
  "attention_executive",
  "social_participation",
  "school_readiness",
  "emotional_regulation",
  "outdoor_confidence",
];

function sortedCategories(scores: Record<string, number>): ResultCategory[] {
  return [...allCategories].sort(
    (a, b) => (scores[b] ?? 0) - (scores[a] ?? 0)
  );
}

function tierLabel(score: number, max: number): string {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.7) return "Notable area";
  if (pct >= 0.4) return "Moderate area";
  return "Lower area";
}

function buildSummaryText(data: Stored): string {
  const sorted = sortedCategories(data.scores);
  const maxScore = Math.max(...Object.values(data.scores), 1);
  const notable = sorted
    .filter((c) => (data.scores[c] ?? 0) / maxScore >= 0.7)
    .map((c) => CATEGORY_LABELS[c]);
  const primaryLabel = CATEGORY_LABELS[data.primary];
  const lines = [
    "TreeTots DFW — Parent Guide Results (Educational Only)",
    "",
    `Primary area: ${primaryLabel}`,
    "",
  ];
  if (notable.length > 1) {
    lines.push(`Notable areas: ${notable.join(", ")}`);
    lines.push("");
  }
  lines.push("All category scores:");
  for (const c of sorted) {
    lines.push(`  ${CATEGORY_LABELS[c]}: ${data.scores[c] ?? 0} / 6`);
  }
  lines.push("");
  lines.push(
    "This guide is for educational purposes only. It is not an occupational therapy evaluation and does not diagnose any condition."
  );
  lines.push("");
  lines.push("Learn more: https://treetotsnatureot.com/groups");
  lines.push("Book a parent call: https://treetotsnatureot.com/book-call");
  return lines.join("\n");
}

/* ---------- sub-components ---------- */

function NoResults() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      <div className="rounded-3xl border border-sage/25 bg-white/80 p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-sand/60">
          <ClipboardList className="size-8 text-moss" aria-hidden />
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold text-forest sm:text-3xl">
          Your guide results are not available in this browser
        </h1>
        <p className="mt-4 text-bark/85 leading-relaxed">
          This can happen if the guide was completed on a different device, the
          browser storage was cleared, or the results link expired.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/quiz"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest px-6 font-medium text-cream shadow hover:bg-forest/90"
          >
            <RefreshCw className="size-4" aria-hidden />
            Start the Parent Guide Again
          </Link>
          <Link
            href="/book-call"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sage/40 px-6 font-medium text-forest hover:bg-cream/60"
          >
            <Phone className="size-4" aria-hidden />
            Book a Parent Call
          </Link>
          <Link
            href="/waitlist"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sage/40 px-6 font-medium text-forest hover:bg-cream/60"
          >
            <ClipboardList className="size-4" aria-hidden />
            Join the Waitlist
          </Link>
        </div>
      </div>
      <div className="rounded-2xl border border-sage/20 bg-cream/60 p-5 text-center text-sm text-bark/80">
        <p>
          The parent guide is educational only and does not diagnose your child
          or replace an occupational therapy evaluation.
        </p>
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  score,
  maxScore,
  isPrimary,
}: {
  category: ResultCategory;
  score: number;
  maxScore: number;
  isPrimary: boolean;
}) {
  const label = CATEGORY_LABELS[category];
  const tier = tierLabel(score, maxScore);
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return (
    <div
      className={`rounded-2xl border p-5 transition-shadow ${
        isPrimary
          ? "border-moss/40 bg-white shadow-md ring-1 ring-moss/15"
          : "border-sand/70 bg-white/80 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-base font-semibold text-forest">
            {label}
          </p>
          <p className="mt-0.5 text-sm text-bark/70">{tier}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tabular-nums text-forest">
            {score}
          </span>
          <span className="text-sm text-bark/50">/ 6</span>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-sand/60">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            isPrimary ? "bg-moss" : "bg-sage"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isPrimary && (
        <p className="mt-2 text-xs font-medium text-moss">
          Primary focus area from your responses
        </p>
      )}
    </div>
  );
}

function EmailCaptureForm({ data }: { data: Stored }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ageRange, setAgeRange] = useState("5-7");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: name,
          parentEmail: email,
          childAgeRange: ageRange,
          cityOrZip: "Not provided",
          mainConcern: note || "Parent guide results email request",
          consentMarketing: true,
          consentPrivacy: consent,
          primaryCategory: data.primary,
          scores: data.scores,
          quizAnswers: [],
          sessionId: data.sessionId,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-3xl border border-moss/25 bg-white/80 p-8 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-moss/10">
          <Check className="size-6 text-moss" aria-hidden />
        </div>
        <p className="mt-4 font-display text-lg font-semibold text-forest">
          Check your inbox
        </p>
        <p className="mt-2 text-sm text-bark/80">
          A summary will arrive shortly. You may unsubscribe anytime.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-sage/25 bg-white/80 p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sand/60">
          <Mail className="size-5 text-moss" aria-hidden />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-forest">
            Email me a copy of my guide results
          </h2>
          <p className="mt-1 text-sm text-bark/75">
            Optional — we will send a summary and may follow up with program
            information. You may unsubscribe anytime.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label
            htmlFor="results-name"
            className="text-sm font-medium text-forest"
          >
            Parent or caregiver name
          </label>
          <input
            id="results-name"
            required
            autoComplete="name"
            className="min-h-11 rounded-xl border border-sand bg-white px-4 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <label
            htmlFor="results-email"
            className="text-sm font-medium text-forest"
          >
            Email
          </label>
          <input
            id="results-email"
            type="email"
            required
            autoComplete="email"
            className="min-h-11 rounded-xl border border-sand bg-white px-4 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <label
            htmlFor="results-age"
            className="text-sm font-medium text-forest"
          >
            Child age range
          </label>
          <select
            id="results-age"
            className="min-h-11 rounded-xl border border-sand bg-white px-4 text-sm"
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
        <div className="grid gap-1.5">
          <label
            htmlFor="results-note"
            className="text-sm font-medium text-forest"
          >
            Note (optional)
          </label>
          <input
            id="results-note"
            className="min-h-11 rounded-xl border border-sand bg-white px-4 text-sm"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything we should know"
          />
        </div>
      </div>
      <label className="mt-4 flex cursor-pointer gap-3 rounded-xl border border-sand bg-cream/40 p-4">
        <input
          type="checkbox"
          className="mt-0.5 size-5 shrink-0"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span className="text-sm text-bark">
          I have read the{" "}
          <Link href="/privacy" className="underline">
            privacy policy
          </Link>{" "}
          and agree to receive informational follow-up. I may unsubscribe
          anytime.
        </span>
      </label>
      {status === "error" && (
        <p className="mt-3 text-sm text-red-800" role="alert">
          Something went wrong. Please try again.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading" || !consent}
        className="mt-5 min-h-12 w-full rounded-full bg-forest font-medium text-cream shadow hover:bg-forest/90 disabled:opacity-40 sm:w-auto sm:px-8"
      >
        {status === "loading" ? "Sending…" : "Email my results"}
      </button>
    </form>
  );
}

/* ---------- main component ---------- */

export function ResultsContent() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get("id");
  const [data, setData] = useState<Stored | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate from storage */
    setData(loadStoredResult(urlId));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [urlId]);

  const sorted = useMemo(
    () => (data ? sortedCategories(data.scores) : []),
    [data]
  );
  const maxScore = useMemo(
    () => (data ? Math.max(...Object.values(data.scores), 1) : 1),
    [data]
  );
  const pathways = data ? CATEGORY_PATHWAYS[data.primary] : [];

  const handleCopy = useCallback(() => {
    if (!data) return;
    navigator.clipboard.writeText(buildSummaryText(data)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [data]);

  const handlePrint = useCallback(() => window.print(), []);

  if (data === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Leaf className="size-8 animate-pulse text-moss" aria-hidden />
        <span className="sr-only">Loading results</span>
      </div>
    );
  }

  if (!data) return <NoResults />;

  const summary = CATEGORY_SUMMARIES[data.primary];

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      {/* ---------- header ---------- */}
      <header className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-moss/10">
          <TreePine className="size-7 text-moss" aria-hidden />
        </div>
        <h1 className="mt-5 font-display text-3xl font-semibold text-forest sm:text-4xl">
          Your Parent Guide Results
        </h1>
        <p className="mt-3 text-bark/80">
          Based on your responses, here is a summary of themes that may be worth
          exploring.
        </p>
      </header>

      {/* ---------- primary summary ---------- */}
      <section
        className="rounded-3xl border border-moss/30 bg-white/90 p-6 shadow-sm sm:p-8"
        aria-labelledby="primary-heading"
      >
        <p className="text-sm font-medium uppercase tracking-wide text-moss">
          Primary focus area
        </p>
        <h2
          id="primary-heading"
          className="mt-2 font-display text-xl font-semibold text-forest sm:text-2xl"
        >
          {summary.title}
        </h2>
        {summary.body.map((p) => (
          <p key={p.slice(0, 32)} className="mt-4 leading-relaxed text-bark/90">
            {p}
          </p>
        ))}
      </section>

      {/* ---------- all categories ---------- */}
      <section aria-labelledby="categories-heading">
        <h2
          id="categories-heading"
          className="font-display text-xl font-semibold text-forest"
        >
          All categories
        </h2>
        <p className="mt-1 text-sm text-bark/70">
          Higher scores reflect areas you selected more often. Maximum per
          category is 6. These numbers are a reflection, not a measurement.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {sorted.map((c) => (
            <CategoryCard
              key={c}
              category={c}
              score={data.scores[c] ?? 0}
              maxScore={maxScore}
              isPrimary={c === data.primary}
            />
          ))}
        </div>
      </section>

      {/* ---------- recommended pathways ---------- */}
      <section
        className="rounded-3xl border border-sage/25 bg-cream/50 p-6 shadow-sm sm:p-8"
        aria-labelledby="pathways-heading"
      >
        <h2
          id="pathways-heading"
          className="font-display text-xl font-semibold text-forest"
        >
          Recommended next steps
        </h2>
        <p className="mt-2 text-sm text-bark/80">
          Based on your primary area, these TreeTots pathways may be a fit.
          Every child is different — what works well can vary.
        </p>
        <div className="mt-5 grid gap-3">
          {pathways.map((pw) => (
            <Link
              key={pw.name}
              href={pw.href}
              className="group flex items-center gap-4 rounded-2xl border border-sand/60 bg-white/80 p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-moss/10">
                <ArrowRight
                  className="size-5 text-moss transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-forest">
                  {pw.name}
                </p>
                <p className="mt-0.5 text-sm text-bark/75">{pw.reason}</p>
              </div>
              <ChevronRight
                className="size-5 shrink-0 text-sage"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- conversion section ---------- */}
      <section
        className="rounded-3xl border border-moss/20 bg-forest/[0.03] p-6 text-center shadow-sm sm:p-8"
        aria-labelledby="cta-heading"
      >
        <h2
          id="cta-heading"
          className="font-display text-xl font-semibold text-forest sm:text-2xl"
        >
          Want help deciding what fits best?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-bark/85 leading-relaxed">
          Every child develops at their own pace. If you are unsure what to do
          next, book a parent call and TreeTots can help you decide whether a
          group, workshop, or individualized OT support may be the best next
          step.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/book-call"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest px-7 font-medium text-cream shadow hover:bg-forest/90"
          >
            <Phone className="size-4" aria-hidden />
            Book a Parent Call
          </Link>
          <Link
            href="/waitlist"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sage/40 px-7 font-medium text-forest hover:bg-cream/60"
          >
            Join the Waitlist
          </Link>
          <Link
            href="/groups"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sage/40 px-7 font-medium text-forest hover:bg-cream/60"
          >
            <Eye className="size-4" aria-hidden />
            View Groups
          </Link>
        </div>
      </section>

      {/* ---------- email capture ---------- */}
      <EmailCaptureForm data={data} />

      {/* ---------- print / copy ---------- */}
      <div className="flex flex-wrap justify-center gap-3 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sage/40 px-5 text-sm font-medium text-forest hover:bg-cream/60"
        >
          <Printer className="size-4" aria-hidden />
          Print results
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sage/40 px-5 text-sm font-medium text-forest hover:bg-cream/60"
        >
          {copied ? (
            <>
              <Check className="size-4 text-moss" aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-4" aria-hidden />
              Copy results summary
            </>
          )}
        </button>
      </div>

      {/* ---------- disclaimer ---------- */}
      <div className="rounded-2xl border border-sage/20 bg-cream/60 p-5 text-center text-sm text-bark/80">
        <p>{QUIZ_DISCLAIMER_SHORT}</p>
      </div>
    </div>
  );
}
