"use client";

import { useState } from "react";

const COMMANDS = [
  { key: "waitlist_demand_by_age", label: "Waitlist demand by age range" },
  { key: "waitlist_demand_by_zip", label: "Waitlist demand by city / ZIP" },
  { key: "referral_partner_activity_month", label: "Recent referral partner activity" },
  { key: "seo_pages_pending_review", label: "SEO pages not reviewed" },
];

export function AgentCommandCenter() {
  const [commandKey, setCommandKey] = useState(COMMANDS[0].key);
  const [preview, setPreview] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function previewCmd() {
    setLoading(true);
    const res = await fetch("/api/admin/agent-commands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commandKey }),
    });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    setPreview(JSON.stringify(j, null, 2));
    setActionId((j as { actionId?: string }).actionId ?? null);
  }

  async function approve(approve: boolean) {
    if (!actionId) return;
    setLoading(true);
    await fetch("/api/admin/agent-commands", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId, approve }),
    });
    setLoading(false);
  }

  return (
    <div className="space-y-6 rounded-2xl border border-sand bg-white/80 p-6">
      <label className="grid gap-2 text-sm font-medium text-forest">
        Command
        <select
          className="min-h-12 max-w-lg rounded-xl border border-sand px-3"
          value={commandKey}
          onChange={(e) => setCommandKey(e.target.value)}
        >
          {COMMANDS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        disabled={loading}
        onClick={() => void previewCmd()}
        className="min-h-12 rounded-full bg-sage px-8 text-cream"
      >
        Preview (no writes)
      </button>
      {preview && (
        <pre className="max-h-80 overflow-auto rounded-xl bg-cream/50 p-4 text-xs">
          {preview}
        </pre>
      )}
      {actionId && (
        <div className="flex flex-wrap gap-3 border-t border-sand pt-4">
          <button
            type="button"
            disabled={loading}
            className="min-h-12 rounded-full bg-forest px-6 text-cream"
            onClick={() => void approve(true)}
          >
            Acknowledge / approve log
          </button>
          <button
            type="button"
            disabled={loading}
            className="min-h-12 rounded-full border border-sage px-6"
            onClick={() => void approve(false)}
          >
            Reject
          </button>
          <p className="text-xs text-bark/70">
            Approving records audit only — extend here to call Airtable API after PHI
            review.
          </p>
        </div>
      )}
    </div>
  );
}
