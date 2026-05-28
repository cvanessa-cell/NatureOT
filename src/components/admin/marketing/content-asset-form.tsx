"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const assetTypes = ["social_post", "email", "blog", "ad_copy", "landing_section", "flyer", "other"];
const channels = ["facebook", "instagram", "email", "google_ads", "blog", "website", "other"];

export function ContentAssetForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    assetType: assetTypes[0],
    channel: channels[0],
    audience: "Parents",
    body: "",
    notes: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/marketing/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          assetType: form.assetType,
          channel: form.channel,
          audience: form.audience,
          body: form.body,
          notes: form.notes,
          runComplianceScan: true,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Could not save content asset");
        return;
      }
      router.push(`/admin/marketing/content/${String(json.contentAssetId)}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-sand bg-white p-6">
      <label className="grid gap-1 text-sm font-medium text-forest">
        Title
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-forest">
          Asset type
          <select
            className="min-h-12 w-full rounded-xl border border-sand bg-white px-4"
            value={form.assetType}
            onChange={(e) => setForm({ ...form, assetType: e.target.value })}
          >
            {assetTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-forest">
          Channel
          <select
            className="min-h-12 w-full rounded-xl border border-sand bg-white px-4"
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value })}
          >
            {channels.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Audience
        <Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Body / caption
        <textarea
          className="min-h-[160px] w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Notes
        <textarea
          className="min-h-[80px] w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </label>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Create draft + run compliance scan"}
      </Button>
    </form>
  );
}
