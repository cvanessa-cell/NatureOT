"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { captureClientAttributionFromUrl, getClientAttributionPayload } from "@/lib/marketing/client-attribution";
import { createMetaEventId, trackMetaEvent } from "@/lib/meta/client-events";

export function ParentGuideLeadForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [consentP, setConsentP] = useState(false);
  const [consentG, setConsentG] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "err">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    captureClientAttributionFromUrl();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const metaEventId = createMetaEventId("lead");
    const res = await fetch("/api/parent-guide-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentName: name,
        parentEmail: email,
        city,
        consentPrivacy: consentP,
        consentGuide: consentG,
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
    trackMetaEvent("Lead", metaEventId, { content_name: "Parent guide" });
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-moss/30 bg-white/90 p-8 shadow-sm">
        <p className="font-display text-2xl text-forest">
          Check your inbox for the guide
        </p>
        <p className="mt-3 text-bark/90">
          If email isn&rsquo;t configured yet in deployment, your team can still export requests from the
          server logs during testing. This is a marketing lead capture— not a clinical record.
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
        <p className="mt-6 text-center text-sm text-bark/80">
          Want a deeper reflection?{" "}
          <Link href="/quiz" className="font-semibold text-moss underline">
            Take the interactive parent guide
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-sage/20 bg-card/95 p-6 shadow-sm"
    >
      <label className="grid gap-1 text-sm font-medium text-forest">
        Parent / caregiver name
        <Input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        City
        <Input required value={city} onChange={(e) => setCity(e.target.value)} />
      </label>
      <label className="flex gap-3 rounded-xl border border-sand bg-cream/40 p-4">
        <input
          type="checkbox"
          className="mt-1 size-5"
          checked={consentG}
          onChange={(e) => setConsentG(e.target.checked)}
          required
        />
        <span className="text-sm text-bark">
          I understand this guide is educational—not an occupational therapy evaluation or diagnosis.
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
      <Button type="submit" disabled={status === "loading"} className="min-h-12 w-full">
        {status === "loading" ? "Sending…" : "Email me the guide"}
      </Button>
    </form>
  );
}
