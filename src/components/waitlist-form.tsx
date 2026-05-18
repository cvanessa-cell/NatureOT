"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { captureClientAttributionFromUrl, getClientAttributionPayload } from "@/lib/marketing/client-attribution";
import { createMetaEventId, trackMetaEvent } from "@/lib/meta/client-events";
import { selectableChoiceClass } from "@/lib/selectable-choice";

const SCHEDULES = [
  "Weekday mornings",
  "Weekday after school",
  "Homeschool daytime",
  "Saturday morning",
  "Flexible",
];

const HEAR_ABOUT = [
  "Google Search",
  "Instagram",
  "Facebook Parent Group",
  "Pediatrician / clinician",
  "School or teacher",
  "Homeschool community",
  "Workshop or event",
  "Friend or family",
  "Other",
];

const INTERESTS = [
  "Sensory regulation",
  "Motor confidence",
  "Emotional regulation",
  "Social participation",
  "School readiness",
  "Outdoor confidence",
  "Homeschool group",
  "Summer camp",
];

export function WaitlistForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [ageRange, setAgeRange] = useState("5-7");
  const [schedule, setSchedule] = useState(SCHEDULES[0]);
  const [hearAbout, setHearAbout] = useState(HEAR_ABOUT[0]);
  const [interests, setInterests] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [consentM, setConsentM] = useState(false);
  const [consentW, setConsentW] = useState(false);
  const [consentP, setConsentP] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "err">("idle");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    captureClientAttributionFromUrl();
  }, []);

  function toggleInterest(i: string) {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const parentName = `${firstName} ${lastName}`.trim();
    const cityOrZip = [city.trim(), zip.trim()].filter(Boolean).join(" · ");
    const generalNotes = [
      notes.trim(),
      `How heard: ${hearAbout}`,
    ]
      .filter(Boolean)
      .join("\n");
    const metaEventId = createMetaEventId("waitlist");

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentName,
        parentEmail: email,
        parentPhone: phone || undefined,
        childAgeRange: ageRange,
        cityOrZip,
        preferredSchedule: schedule,
        interestAreas: interests,
        generalNotes: generalNotes || undefined,
        consentMarketing: consentM,
        consentWaitlist: consentW,
        consentPrivacy: consentP,
        meta_event_id: metaEventId,
        ...getClientAttributionPayload(),
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("err");
      setMsg(j.error ?? "Unable to save");
      return;
    }
    trackMetaEvent("Lead", metaEventId, { content_name: "Waitlist" });
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-moss/30 bg-white/90 p-8 text-center shadow-sm">
        <p className="font-display text-2xl text-forest">
          You&rsquo;re on the interest list
        </p>
        <p className="mt-3 text-bark/90">
          We&rsquo;ll send next steps and availability updates when cohorts open. This is not a guarantee of
          placement or specific outcomes for your child.
        </p>
        <Link
          href="/book-call"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-8 font-medium text-cream"
        >
          Book a Parent Call
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-2xl border border-sage/20 bg-card/95 p-6 shadow-sm"
    >
      <p className="rounded-xl border border-sage/15 bg-cream/50 p-3 text-sm text-bark">
        We only ask for basic information needed to understand group fit and follow up with you. Do not
        include diagnoses, medical records, or your child&rsquo;s birthdate.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-forest">
          Parent first name
          <input
            required
            className="min-h-12 rounded-xl border border-sand px-3"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-forest">
          Parent last name
          <input
            required
            className="min-h-12 rounded-xl border border-sand px-3"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Email
        <input
          required
          type="email"
          className="min-h-12 rounded-xl border border-sand px-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Phone (optional)
        <input
          type="tel"
          className="min-h-12 rounded-xl border border-sand px-3"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-forest">
          City
          <input
            required
            className="min-h-12 rounded-xl border border-sand px-3"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-forest">
          ZIP
          <input
            required
            className="min-h-12 rounded-xl border border-sand px-3"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            inputMode="numeric"
            autoComplete="postal-code"
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Child age range
        <select
          className="min-h-12 rounded-xl border border-sand px-3"
          value={ageRange}
          onChange={(e) => setAgeRange(e.target.value)}
        >
          <option value="2-4">2–4</option>
          <option value="5-7">5–7</option>
          <option value="8-10">8–10</option>
          <option value="11-13">11–13</option>
          <option value="14+">14+</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Preferred schedule
        <select
          className="min-h-12 rounded-xl border border-sand px-3"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
        >
          {SCHEDULES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        How did you hear about us?
        <select
          className="min-h-12 rounded-xl border border-sand px-3"
          value={hearAbout}
          onChange={(e) => setHearAbout(e.target.value)}
        >
          {HEAR_ABOUT.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="text-sm font-medium text-forest">
          General interest areas
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <button
              key={i}
              type="button"
              aria-pressed={interests.includes(i)}
              onClick={() => toggleInterest(i)}
              className={selectableChoiceClass(interests.includes(i), "chip")}
            >
              {i}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Notes (optional, general themes only)
        <textarea
          className="min-h-[100px] rounded-xl border border-sand px-3 py-2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={1500}
        />
      </label>
      <label className="flex gap-3 rounded-xl border border-sand bg-cream/40 p-4">
        <input
          type="checkbox"
          className="mt-1 size-5"
          checked={consentW}
          onChange={(e) => setConsentW(e.target.checked)}
          required
        />
        <span className="text-sm text-bark">
          I want to join the waitlist for nature-based pediatric OT groups (informational interest list).
        </span>
      </label>
      <label className="flex gap-3 rounded-xl border border-sand bg-cream/40 p-4">
        <input
          type="checkbox"
          className="mt-1 size-5"
          checked={consentM}
          onChange={(e) => setConsentM(e.target.checked)}
        />
        <span className="text-sm text-bark">
          I agree to receive emails or texts about programs and scheduling (optional).
        </span>
      </label>
      <label className="flex gap-3 rounded-xl border border-sand bg-cream/40 p-4">
        <input
          type="checkbox"
          className="mt-1 size-5"
          checked={consentP}
          onChange={(e) => setConsentP(e.target.checked)}
          required
        />
        <span className="text-sm text-bark">
          I have read the{" "}
          <a href="/privacy" className="underline">
            privacy policy
          </a>
          .
        </span>
      </label>
      {status === "err" && (
        <p className="text-sm text-red-800" role="alert">
          {msg}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="min-h-14 w-full rounded-full bg-forest font-medium text-cream hover:bg-sage disabled:opacity-40"
      >
        {status === "loading" ? "Saving…" : "Join the Waitlist"}
      </button>
    </form>
  );
}
