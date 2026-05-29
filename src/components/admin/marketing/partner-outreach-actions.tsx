"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PartnerOutreachActions({
  organizationId,
  organizationName,
}: {
  organizationId: string;
  organizationName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"create" | "draft" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: "create" | "draft_intro") {
    setBusy(action === "create" ? "create" : "draft");
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/marketing/partners/${organizationId}/outreach-tasks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        task?: { subject?: string };
        linkedCampaignId?: string | null;
      };
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Could not create outreach task");
        return;
      }
      const subject = json.task?.subject ?? "Outreach task";
      const campaignNote = json.linkedCampaignId ? " Linked to OTinNATURE campaign." : "";
      setMessage(
        action === "draft_intro"
          ? `Draft intro email task created for ${organizationName}.${campaignNote}`
          : `Created “${subject}”.${campaignNote}`
      );
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={busy !== null}
          onClick={() => void run("create")}
        >
          {busy === "create" ? "Creating…" : "Create outreach task"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy !== null}
          onClick={() => void run("draft_intro")}
        >
          {busy === "draft" ? "Drafting…" : "Draft intro email"}
        </Button>
      </div>
      {message && <p className="text-sm text-moss">{message}</p>}
      {error && <p className="text-sm text-red-800">{error}</p>}
    </div>
  );
}
