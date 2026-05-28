"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ScanState = {
  riskLevel: string;
  flaggedTerms: string[];
  suggestions: string[];
} | null;

export function ComplianceScanner({ contentAssetId }: { contentAssetId?: string }) {
  const [text, setText] = useState("");
  const [scan, setScan] = useState<ScanState>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function runScan() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/marketing/compliance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(typeof json.error === "string" ? json.error : "Scan failed");
        return;
      }
      setScan({
        riskLevel: json.riskLevel,
        flaggedTerms: json.flaggedTerms ?? [],
        suggestions: json.suggestions ?? [],
      });
    } finally {
      setBusy(false);
    }
  }

  async function saveReview(approved: boolean) {
    if (!scan) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/marketing/compliance/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          contentAssetId,
          approved,
          riskLevel: scan.riskLevel,
          flaggedTerms: scan.flaggedTerms,
          suggestions: scan.suggestions,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(typeof json.error === "string" ? json.error : "Could not save review");
        return;
      }
      setMessage(approved ? "Review saved — marked approved." : "Review saved — flagged for revision.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <textarea
        className="min-h-[140px] w-full rounded-xl border border-sand bg-white/90 p-3 text-sm"
        placeholder="Paste a caption, email, ad copy, or landing page section..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={busy || !text.trim()} onClick={() => void runScan()}>
          Scan
        </Button>
        <Button type="button" disabled={busy || !scan} onClick={() => void saveReview(true)}>
          Save as approved
        </Button>
        <Button type="button" variant="outline" disabled={busy || !scan} onClick={() => void saveReview(false)}>
          Save review (needs revision)
        </Button>
      </div>
      {scan && (
        <div className="rounded-xl border border-sand bg-cream/40 p-4 text-sm">
          <p className="font-medium text-forest">
            Risk level{" "}
            <Badge
              tone={
                scan.riskLevel === "approved"
                  ? "success"
                  : scan.riskLevel === "high_risk" || scan.riskLevel === "do_not_use"
                    ? "danger"
                    : "warning"
              }
            >
              {scan.riskLevel}
            </Badge>
          </p>
          {scan.flaggedTerms.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-bark/85">
              {scan.flaggedTerms.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          {scan.suggestions.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-bark/85">
              {scan.suggestions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {message && <p className="text-sm text-forest">{message}</p>}
    </div>
  );
}
