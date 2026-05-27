"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { captureClientAttributionFromUrl, getClientAttributionPayload } from "@/lib/marketing/client-attribution";
import { createMetaEventId, trackMetaEvent } from "@/lib/meta/client-events";

const workshops = [
  { id: "sensory-seekers", title: "Helping Sensory-Seeking Kids Thrive Outdoors" },
  { id: "regulation-attention", title: "Nature Play for Regulation and Attention" },
  { id: "motor-confidence", title: "Outdoor Play for Motor Confidence" },
  { id: "big-emotions", title: "Supporting Big Emotions Through Movement" },
  { id: "homeschool-strategies", title: "Homeschool Nature Play + OT Strategies" },
];

export function WorkshopRegistrationSection() {
  const [workshopId, setWorkshopId] = useState(workshops[0].id);
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [consentP, setConsentP] = useState(false);
  const [consentR, setConsentR] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "err">("idle");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    captureClientAttributionFromUrl();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const metaEventId = createMetaEventId("workshop");
    const res = await fetch("/api/workshop-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentName,
        parentEmail: email,
        phone: phone || undefined,
        workshopId,
        city: city || undefined,
        consentPrivacy: consentP,
        consentReminders: consentR,
        meta_event_id: metaEventId,
        ...getClientAttributionPayload(),
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("err");
      setMsg(j.error ?? "Unable to submit");
      return;
    }
    trackMetaEvent("CompleteRegistration", metaEventId, {
      content_name: "Workshop registration",
      content_category: workshopId,
    });
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-moss/30 bg-white/90 p-8 shadow-sm">
        <p className="font-display text-2xl text-forest">
          You&rsquo;re registered
        </p>
        <p className="mt-3 text-bark/90">
          We&rsquo;ll send reminders if enabled and share logistics as the date approaches.
          Educational programming only—not a substitute for individualized evaluation.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/waitlist"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-forest px-6 text-center font-medium text-cream"
          >
            Join the waitlist
          </Link>
          <Link
            href="/book-call"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border-2 border-sage/40 px-6 text-center font-medium text-forest"
          >
            Book a parent call
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-2xl border border-sage/20 bg-card/95 p-6 shadow-sm"
      noValidate
    >
      <h2 className="font-display text-2xl text-forest">
        Workshop registration
      </h2>
      <p className="text-sm text-bark/85">
        We only ask for basic contact details. Please do not include diagnoses or medical records.
      </p>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Workshop
        <select
          className="min-h-12 rounded-xl border border-sand bg-white px-3 text-forest"
          value={workshopId}
          onChange={(e) => setWorkshopId(e.target.value)}
        >
          {workshops.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Parent / caregiver name
        <Input
          required
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
          autoComplete="name"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Email
        <Input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Phone (optional)
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        City (optional)
        <Input value={city} onChange={(e) => setCity(e.target.value)} />
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
      <label className="flex gap-3 rounded-xl border border-sand bg-cream/40 p-4">
        <input
          type="checkbox"
          className="mt-1 size-5"
          checked={consentR}
          onChange={(e) => setConsentR(e.target.checked)}
        />
        <span className="text-sm text-bark">
          Email me workshop reminders and practical tips (optional).
        </span>
      </label>
      {status === "err" && (
        <p className="text-sm text-red-800" role="alert">
          {msg}
        </p>
      )}
      <Button type="submit" disabled={status === "loading"} className="min-h-12 w-full">
        {status === "loading" ? "Submitting…" : "Register"}
      </Button>
    </form>
  );
}

export function WorkshopCards() {
  const placeholders = [
    { title: "Helping Sensory-Seeking Kids Thrive Outdoors", when: "Fall 2026 · Date TBA", where: "Outdoor venue · Texas" },
    { title: "Nature Play for Regulation and Attention", when: "Fall 2026 · Date TBA", where: "Outdoor venue · Texas" },
    { title: "Outdoor Play for Motor Confidence", when: "Winter 2026 · Date TBA", where: "Outdoor venue · Texas" },
    { title: "Supporting Big Emotions Through Movement", when: "Winter 2026 · Date TBA", where: "Outdoor venue · Texas" },
    { title: "Homeschool Nature Play + OT Strategies", when: "Spring 2026 · Date TBA", where: "Outdoor venue · Texas" },
  ];
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {placeholders.map((w) => (
        <div
          key={w.title}
          className="rounded-2xl border border-sand bg-card/95 p-6 shadow-sm"
        >
          <h3 className="font-display text-xl text-forest">
            {w.title}
          </h3>
          <p className="mt-2 text-sm text-bark/80">{w.when}</p>
          <p className="text-sm text-bark/80">{w.where}</p>
          <p className="mt-4 text-sm text-bark/90">
            Practical, parent-forward strategies grounded in outdoor play and pediatric OT
            leadership—without promising outcomes for every family.
          </p>
          <a
            href="#register"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-sage/15 px-5 text-sm font-semibold text-forest hover:bg-sage/25"
          >
            Register
          </a>
        </div>
      ))}
    </div>
  );
}
