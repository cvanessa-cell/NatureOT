"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import type { CheckoutOption } from "@/lib/services-catalog";
import { cn } from "@/lib/cn";

type FormState = {
  parent: string;
  email: string;
  child: string;
  location: string;
  consent: boolean;
};

export function CheckoutForm({
  option,
  paymentsReady,
}: {
  option: CheckoutOption;
  paymentsReady: boolean;
}) {
  const [form, setForm] = useState<FormState>({
    parent: "",
    email: "",
    child: "",
    location: option.defaultLocation,
    consent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: option.priceId,
          service: option.name,
          serviceSlug: option.slug,
          parent: form.parent.trim(),
          email: form.email.trim(),
          child: form.child.trim() || undefined,
          location: form.location,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Unable to start checkout. Please try again or contact us.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isVirtualOnly = option.defaultLocation === "virtual";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!paymentsReady && (
        <ComplianceBanner className="text-left">
          <p>
            Online payments are not configured yet. You can still{" "}
            <a href="/book-call" className="font-semibold text-moss underline">
              book a parent call
            </a>{" "}
            or{" "}
            <a href="/waitlist" className="font-semibold text-moss underline">
              join the waitlist
            </a>
            .
          </p>
        </ComplianceBanner>
      )}

      <label className="block text-left text-sm font-medium text-forest">
        Parent / caregiver name
        <input
          required
          disabled={loading || !paymentsReady}
          className="mt-1 w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-forest outline-none focus:border-moss/50 focus:ring-2 focus:ring-moss/20"
          placeholder="Your name"
          value={form.parent}
          onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}
          autoComplete="name"
        />
      </label>

      <label className="block text-left text-sm font-medium text-forest">
        Email
        <input
          required
          type="email"
          disabled={loading || !paymentsReady}
          className="mt-1 w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-forest outline-none focus:border-moss/50 focus:ring-2 focus:ring-moss/20"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          autoComplete="email"
        />
      </label>

      <label className="block text-left text-sm font-medium text-forest">
        Child first name or initials{" "}
        <span className="font-normal text-forest/55">(optional)</span>
        <input
          disabled={loading || !paymentsReady}
          className="mt-1 w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-forest outline-none focus:border-moss/50 focus:ring-2 focus:ring-moss/20"
          placeholder="e.g. A. or Alex"
          value={form.child}
          onChange={(e) => setForm((f) => ({ ...f, child: e.target.value }))}
          maxLength={40}
        />
      </label>

      <label className="block text-left text-sm font-medium text-forest">
        Preferred format
        <select
          required
          disabled={loading || !paymentsReady}
          className="mt-1 w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-forest outline-none focus:border-moss/50 focus:ring-2 focus:ring-moss/20"
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
        >
          {isVirtualOnly ? (
            <option value="virtual">Virtual</option>
          ) : (
            <>
              <option value="">Select preferred location</option>
              <option value="outdoor">Outdoor (DFW area)</option>
              <option value="virtual">Virtual</option>
            </>
          )}
        </select>
      </label>

      <label className="flex items-start gap-3 text-left text-sm text-bark/90">
        <input
          required
          type="checkbox"
          disabled={loading || !paymentsReady}
          checked={form.consent}
          onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
          className="mt-1 size-4 rounded border-sand"
        />
        <span>
          I understand this is not emergency medical care and participation may depend on
          therapist fit and availability.
        </span>
      </label>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading || !form.consent || !paymentsReady}
        className={cn("w-full", !paymentsReady && "opacity-60")}
      >
        {loading ? "Redirecting…" : "Proceed to payment"}
      </Button>

      <p className="text-center text-xs leading-relaxed text-forest/55">
        Not sure which option fits?{" "}
        <a href="/book-call" className="font-semibold text-moss underline">
          Book a parent fit call
        </a>
        . We collect only what we need to book your spot—no diagnosis or clinical records on this
        form.
      </p>
    </form>
  );
}
