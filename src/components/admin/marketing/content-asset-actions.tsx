"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ContentAssetActions({
  assetId,
  complianceStatus,
}: {
  assetId: string;
  complianceStatus: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const blocked = complianceStatus === "high_risk" || complianceStatus === "do_not_use";

  async function run(action: "approve_schedule" | "mark_published") {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/marketing/content/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(typeof json.error === "string" ? json.error : "Action failed");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button type="button" disabled={busy || blocked} onClick={() => void run("approve_schedule")}>
        Approve & schedule
      </Button>
      <Button type="button" variant="outline" disabled={busy} onClick={() => void run("mark_published")}>
        Mark published
      </Button>
      {blocked && (
        <p className="w-full text-sm text-amber-900">
          Scheduling blocked until compliance status is cleared.
        </p>
      )}
      {message && <p className="w-full text-sm text-red-800">{message}</p>}
    </div>
  );
}
