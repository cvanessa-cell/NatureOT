"use client";

import { useState } from "react";

const SAMPLE_KEYS = [
  "waitlist_entry",
  "new_lead",
  "workshop_registration",
  "booking_created",
  "feedback_submitted",
  "review_request",
  "referral_followup",
  "content_scheduling",
  "local_seo_build",
  "automation_error",
  "unsubscribe_event",
] as const;

export function ZapierDryRunButtons() {
  const [status, setStatus] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function triggerDryRun(opts: {
    zapKey: (typeof SAMPLE_KEYS)[number];
    adminApprovedExternal?: boolean;
    simulateUnsubscribed?: boolean;
  }) {
    setBusyKey(opts.zapKey);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/zapier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "dry_run_payload",
          zapKey: opts.zapKey,
          adminApprovedExternal: opts.adminApprovedExternal ?? false,
          simulateUnsubscribed: opts.simulateUnsubscribed ?? false,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(payload.error ?? `HTTP ${res.status}`);
        return;
      }
      setStatus(
        `Dry-run queued for ${opts.zapKey} — inspect zapier_events (fixture: ${payload.preview?.fixtureLabel})`
      );
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="mt-4 space-y-4 text-sm text-bark/80">
      <div className="flex flex-wrap gap-2">
        {SAMPLE_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            disabled={busyKey !== null}
            onClick={() =>
              triggerDryRun({
                zapKey: k,
                adminApprovedExternal:
                  k === "content_scheduling" ||
                  k === "local_seo_build" ||
                  k === "review_request" ||
                  k === "referral_followup" ||
                  k === "feedback_submitted",
              })
            }
            className="rounded-full border border-forest/20 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-forest hover:border-forest/40 disabled:opacity-60"
          >
            {busyKey === k ? "Queuing…" : k.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-[11px]">
        <button
          type="button"
          className="rounded border border-bark/20 px-2 py-1"
          disabled={busyKey !== null}
          onClick={() =>
            triggerDryRun({
              zapKey: "booking_created",
              simulateUnsubscribed: true,
            })
          }
        >
          Simulate unsubscribed booking attempt
        </button>
      </div>
      {status && (
        <p className="rounded border border-moss/40 bg-moss/10 px-3 py-2 text-xs text-forest">
          {status}
        </p>
      )}
    </div>
  );
}
