"use client";

import { useState } from "react";

type Seq = {
  id: string;
  name: string;
  slug: string;
  category_slug: string | null;
  is_active: boolean;
  steps: unknown;
};

export function SequenceEditor({ initialSequences }: { initialSequences: Seq[] }) {
  const [selected, setSelected] = useState(initialSequences[0]?.id ?? "");
  const [json, setJson] = useState(
    () => JSON.stringify(initialSequences[0]?.steps ?? [], null, 2)
  );
  const [status, setStatus] = useState<string | null>(null);

  const current = initialSequences.find((s) => s.id === selected);

  function onSelect(id: string) {
    setSelected(id);
    const s = initialSequences.find((x) => x.id === id);
    setJson(JSON.stringify(s?.steps ?? [], null, 2));
  }

  async function save() {
    setStatus(null);
    let steps: unknown;
    try {
      steps = JSON.parse(json);
    } catch {
      setStatus("Invalid JSON");
      return;
    }
    const res = await fetch(`/api/admin/sequences/${selected}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steps }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setStatus(j.error ?? "Save failed");
      return;
    }
    setStatus("Saved");
  }

  if (!initialSequences.length) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
        No sequences found. Run <code className="rounded bg-white px-1">supabase/seed.sql</code>.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <label className="grid gap-2 text-sm font-medium text-forest">
        Sequence
        <select
          className="min-h-12 max-w-lg rounded-xl border border-sand bg-white px-3"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
        >
          {initialSequences.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.slug})
            </option>
          ))}
        </select>
      </label>
      {current && (
        <p className="text-sm text-bark/70">
          Slug: <code>{current.slug}</code>
          {current.category_slug && (
            <>
              {" "}
              · Category: <code>{current.category_slug}</code>
            </>
          )}
        </p>
      )}
      <label className="grid gap-2 text-sm font-medium text-forest">
        Steps JSON
        <textarea
          className="min-h-[320px] w-full rounded-xl border border-sand bg-white/90 p-3 font-mono text-sm"
          value={json}
          onChange={(e) => setJson(e.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={() => void save()}
        className="min-h-12 rounded-full bg-sage px-8 font-medium text-cream"
      >
        Save sequence
      </button>
      {status && <p className="text-sm text-moss">{status}</p>}
    </div>
  );
}
