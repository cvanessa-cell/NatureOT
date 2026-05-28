"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  "Pediatrician",
  "School",
  "Preschool",
  "SLP",
  "PT",
  "Counselor",
  "Homeschool group",
  "Nature school",
  "Library",
  "Parks/recreation",
  "Other",
];

export function OrganizationForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: categories[0],
    city: "",
    email: "",
    phone: "",
    website: "",
    permissionToContact: false,
    notes: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/marketing/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Could not save organization");
        return;
      }
      router.push(`/admin/marketing/partners/${String(json.organizationId)}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-sand bg-white p-6">
      <label className="grid gap-1 text-sm font-medium text-forest">
        Organization name
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Category
        <select
          className="min-h-12 w-full rounded-xl border border-sand bg-white px-4 text-forest"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-forest">
          City
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </label>
        <label className="grid gap-1 text-sm font-medium text-forest">
          Email
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="grid gap-1 text-sm font-medium text-forest">
          Phone
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label className="grid gap-1 text-sm font-medium text-forest">
          Website
          <Input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-bark/85">
        <input
          type="checkbox"
          checked={form.permissionToContact}
          onChange={(e) => setForm({ ...form, permissionToContact: e.target.checked })}
        />
        Permission to contact on file
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Notes
        <textarea
          className="min-h-[100px] w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </label>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Create organization"}
      </Button>
    </form>
  );
}
