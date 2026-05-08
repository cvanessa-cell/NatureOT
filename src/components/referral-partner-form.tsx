"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { captureClientAttributionFromUrl, getClientAttributionPayload } from "@/lib/marketing/client-attribution";

const TYPES = [
  "Pediatrician",
  "School",
  "Preschool",
  "SLP",
  "PT",
  "Counselor",
  "Homeschool group",
  "Nature school",
  "Parent group",
  "Library",
  "Parks/recreation",
  "Other",
];

export function ReferralPartnerForm() {
  const [org, setOrg] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [partnerType, setPartnerType] = useState(TYPES[0]);
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [consentP, setConsentP] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "err">("idle");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    captureClientAttributionFromUrl();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/referral-inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationName: org,
        contactName: contact,
        email,
        phone: phone || undefined,
        partnerType,
        city,
        message: message || undefined,
        consentPrivacy: consentP,
        ...getClientAttributionPayload(),
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("err");
      setMsg(j.error ?? "Unable to submit");
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-moss/30 bg-white/90 p-8 shadow-sm">
        <p className="font-[family-name:var(--font-fraunces)] text-2xl text-forest">
          Thank you—your request is in our outreach queue
        </p>
        <p className="mt-3 text-bark/90">
          Our team will follow up with operational materials appropriate for partners.
          We never send confidential clinical records through general marketing channels.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-sage/20 bg-card/95 p-6 shadow-sm"
    >
      <h2 className="font-[family-name:var(--font-fraunces)] text-2xl text-forest">
        Request referral packet
      </h2>
      <p className="text-sm text-bark/85">
        Minimum operational fields only—no patient identifiers or clinical documentation here.
      </p>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Organization name
        <Input required value={org} onChange={(e) => setOrg(e.target.value)} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Contact name
        <Input required value={contact} onChange={(e) => setContact(e.target.value)} />
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
        <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Partner type
        <select
          className="min-h-12 w-full rounded-xl border border-sand bg-white px-3"
          value={partnerType}
          onChange={(e) => setPartnerType(e.target.value)}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        City
        <Input required value={city} onChange={(e) => setCity(e.target.value)} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Message (optional)
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} />
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
          </a>{" "}
          and understand this form is for operational outreach—not clinical referral records.
        </span>
      </label>
      {status === "err" && (
        <p className="text-sm text-red-800" role="alert">
          {msg}
        </p>
      )}
      <Button type="submit" disabled={status === "loading"} className="min-h-12 w-full">
        {status === "loading" ? "Sending…" : "Request referral packet"}
      </Button>
    </form>
  );
}
