"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MEMBERSHIP_DISCLAIMERS, type MembershipBillingInterval } from "@/lib/membership-catalog";
import { trackMembershipEvent } from "@/lib/analytics/membership-events";
import { cn } from "@/lib/cn";

type FormState = {
  parent: string;
  email: string;
  consent: boolean;
};

type PlanCard = {
  billingInterval: MembershipBillingInterval;
  title: string;
  priceLabel: string;
  savingsLabel?: string;
  paymentsReady: boolean;
};

export function MembershipCheckoutPanel({ plans }: { plans: PlanCard[] }) {
  const [form, setForm] = useState<FormState>({
    parent: "",
    email: "",
    consent: false,
  });
  const [loadingInterval, setLoadingInterval] = useState<MembershipBillingInterval | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackMembershipEvent("membership_page_view");
  }, []);

  async function startCheckout(billingInterval: MembershipBillingInterval) {
    setError(null);
    setLoadingInterval(billingInterval);
    trackMembershipEvent(
      billingInterval === "annual" ? "membership_annual_click" : "membership_monthly_click",
      { billingInterval },
    );

    try {
      const res = await fetch("/api/checkout/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingInterval,
          parent: form.parent.trim(),
          email: form.email.trim(),
          source: "membership_page",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Unable to start membership checkout. Please try again.");
        return;
      }
      trackMembershipEvent("membership_checkout_started", { billingInterval });
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingInterval(null);
    }
  }

  const formReady = Boolean(form.parent.trim() && form.email.trim() && form.consent);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-left text-sm font-medium text-forest">
          Parent / caregiver name
          <input
            required
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
            className="mt-1 w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-forest outline-none focus:border-moss/50 focus:ring-2 focus:ring-moss/20"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            autoComplete="email"
          />
        </label>
      </div>

      <label className="flex items-start gap-3 text-left text-sm text-bark/90">
        <input
          required
          type="checkbox"
          checked={form.consent}
          onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
          className="mt-1 size-4 rounded border-sand"
        />
        <span>
          I understand TreeTots Family Membership is a caregiver resource and priority-access
          membership, not individualized occupational therapy or a guarantee of group placement.
        </span>
      </label>

      <div className="grid gap-4 lg:grid-cols-2" id="pricing">
        {plans.map((plan) => {
          const loading = loadingInterval === plan.billingInterval;
          return (
            <article
              key={plan.billingInterval}
              className={cn(
                "relative rounded-[1.75rem] border bg-white p-6 shadow-sm shadow-forest/10",
                plan.billingInterval === "annual" ? "border-moss/35" : "border-sand/70",
              )}
            >
              {plan.savingsLabel ? (
                <span className="absolute right-5 top-5 rounded-full bg-sage px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest">
                  {plan.savingsLabel}
                </span>
              ) : null}
              <h3 className="font-display text-2xl font-semibold text-forest">{plan.title}</h3>
              <p className="mt-3 text-4xl font-semibold text-forest">{plan.priceLabel}</p>
              <p className="mt-3 text-sm leading-relaxed text-forest/65">
                Includes priority access, monthly caregiver resources, early programming notice,
                and community connection when available.
              </p>
              <Button
                type="button"
                className="mt-6 w-full"
                disabled={!formReady || loadingInterval !== null || !plan.paymentsReady}
                aria-busy={loading}
                onClick={() => void startCheckout(plan.billingInterval)}
              >
                {loading
                  ? "Redirecting to Stripe..."
                  : plan.billingInterval === "annual"
                    ? "Join Annually"
                    : "Join Monthly"}
              </Button>
              {!plan.paymentsReady ? (
                <p className="mt-3 text-xs leading-relaxed text-forest/55">
                  Online membership checkout is not configured yet. You can still book a parent fit
                  call.
                </p>
              ) : null}
            </article>
          );
        })}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      <ul className="grid gap-2 text-left text-xs leading-relaxed text-forest/60 sm:grid-cols-2">
        {MEMBERSHIP_DISCLAIMERS.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-moss/70" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
