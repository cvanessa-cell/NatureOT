"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  "Launch",
  "Content",
  "Outreach",
  "Campaign",
  "Partners",
  "Compliance",
  "Operations",
];

export function AccountabilityTaskForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: categories[0],
    description: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/marketing/accountability/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Could not create task");
        return;
      }
      router.push(`/admin/marketing/accountability/${String(json.taskId)}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-sand bg-white p-6">
      <label className="grid gap-1 text-sm font-medium text-forest">
        Task title
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </label>
      <label className="grid gap-1 text-sm font-medium text-forest">
        Category
        <select
          className="min-h-12 w-full rounded-xl border border-sand bg-white px-4"
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
      <label className="grid gap-1 text-sm font-medium text-forest">
        Description
        <textarea
          className="min-h-[100px] w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-forest">
          Due date
          <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </label>
        <label className="grid gap-1 text-sm font-medium text-forest">
          Priority
          <select
            className="min-h-12 w-full rounded-xl border border-sand bg-white px-4"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as typeof form.priority })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Create task"}
      </Button>
    </form>
  );
}
