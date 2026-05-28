"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const statuses = [
  "not_started",
  "in_progress",
  "waiting",
  "needs_review",
  "complete",
  "blocked",
  "missed",
  "deferred",
] as const;

export function AccountabilityTaskActions({
  taskId,
  currentStatus,
}: {
  taskId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function saveStatus(next: string) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/marketing/accountability/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(typeof json.error === "string" ? json.error : "Update failed");
        return;
      }
      setStatus(next);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="min-h-10 rounded-xl border border-sand bg-white px-3 text-sm"
        value={status}
        onChange={(e) => void saveStatus(e.target.value)}
        disabled={busy}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <Button type="button" variant="outline" disabled={busy} onClick={() => void saveStatus("complete")}>
        Mark complete
      </Button>
      {message && <span className="text-sm text-red-800">{message}</span>}
    </div>
  );
}
