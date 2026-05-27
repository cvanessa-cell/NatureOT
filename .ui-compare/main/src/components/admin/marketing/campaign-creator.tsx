"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TemplateRow = { id: string; key: string; name: string };

export function CampaignCreator({ templates }: { templates: TemplateRow[] }) {
  const [templateKey, setTemplateKey] = useState(templates[0]?.key ?? "");
  const [name, setName] = useState("");
  const [cities, setCities] = useState("Fort Worth, Dallas");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const selected = useMemo(
    () => templates.find((t) => t.key === templateKey) ?? null,
    [templates, templateKey]
  );

  async function create() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/marketing/campaigns/create-from-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateKey,
          name: name.trim() || `${selected?.name ?? "Campaign"} — ${new Date().toLocaleDateString()}`,
          cities: cities
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
        }),
      });
      const j = await res.json().catch(() => ({}));
      setResult({ ok: res.ok, ...j });
      if (res.ok && j?.campaignId) {
        window.location.href = `/admin/marketing/campaigns/${String(j.campaignId)}`;
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="grid gap-2 text-sm font-medium text-forest">
        Template
        <select
          className="min-h-12 max-w-xl rounded-xl border border-sand bg-white px-3"
          value={templateKey}
          onChange={(e) => setTemplateKey(e.target.value)}
        >
          {templates.map((t) => (
            <option key={t.id} value={t.key}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium text-forest">
        Campaign name
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Homeschool groups — May launch" />
      </label>

      <label className="grid gap-2 text-sm font-medium text-forest">
        Cities targeted (comma-separated)
        <Input value={cities} onChange={(e) => setCities(e.target.value)} placeholder="Fort Worth, Dallas, Keller" />
      </label>

      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={busy || !templateKey} onClick={() => void create()}>
          Create campaign
        </Button>
      </div>

      {result && (
        <pre className="overflow-x-auto rounded-xl border border-sand bg-white/80 p-3 text-xs text-bark">
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

