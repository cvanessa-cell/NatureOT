"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LinkBuilderClient({ campaigns }: { campaigns: Array<{ id: string; name: string; slug: string; status: string }> }) {
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? "");
  const [label, setLabel] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [content, setContent] = useState("");
  const [term, setTerm] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");

  async function buildLink(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/marketing/link-builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, label, destinationUrl, source, medium, content, term }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) setGeneratedUrl(json.generatedUrl ?? "");
  }

  return (
    <form onSubmit={buildLink} className="space-y-4 rounded-2xl border border-sand bg-white p-6">
      <label className="grid gap-1 text-sm font-medium">
        Campaign
        <select className="min-h-11 rounded-xl border border-sand px-3" value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.status})
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium">Label<input className="min-h-11 rounded-xl border border-sand px-3" value={label} onChange={(e) => setLabel(e.target.value)} required /></label>
      <label className="grid gap-1 text-sm font-medium">Destination URL<input className="min-h-11 rounded-xl border border-sand px-3" value={destinationUrl} onChange={(e) => setDestinationUrl(e.target.value)} required /></label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">Source<input className="min-h-11 rounded-xl border border-sand px-3" value={source} onChange={(e) => setSource(e.target.value)} /></label>
        <label className="grid gap-1 text-sm font-medium">Medium<input className="min-h-11 rounded-xl border border-sand px-3" value={medium} onChange={(e) => setMedium(e.target.value)} /></label>
        <label className="grid gap-1 text-sm font-medium">Content<input className="min-h-11 rounded-xl border border-sand px-3" value={content} onChange={(e) => setContent(e.target.value)} /></label>
        <label className="grid gap-1 text-sm font-medium">Term<input className="min-h-11 rounded-xl border border-sand px-3" value={term} onChange={(e) => setTerm(e.target.value)} /></label>
      </div>
      <Button type="submit">Generate link</Button>
      {generatedUrl ? <p className="rounded-xl bg-cream/70 p-3 text-sm break-all">{generatedUrl}</p> : null}
    </form>
  );
}
