"use client";

import { useIsPresentationTool } from "next-sanity/hooks";

export function DisableDraftMode() {
  const isPresentationTool = useIsPresentationTool();

  if (isPresentationTool) return null;

  return (
    <a
      href="/api/draft-mode/disable"
      className="fixed bottom-20 right-4 z-50 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream shadow-lg transition hover:bg-forest/90"
    >
      Disable Draft Mode
    </a>
  );
}
