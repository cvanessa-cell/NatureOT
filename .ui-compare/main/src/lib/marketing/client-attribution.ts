"use client";

const STORAGE_KEY = "treetots_attribution_v1";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type ClientAttributionState = {
  firstTouch: Record<string, string>;
  lastTouch: Record<string, string>;
  capturedAt: string;
  expiresAt: number;
};

const TRACKING_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"] as const;

function readStorage(): ClientAttributionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClientAttributionState;
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persistStorage(state: ClientAttributionState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function captureClientAttributionFromUrl(url = window.location.href) {
  const params = new URL(url).searchParams;
  const captured: Record<string, string> = {};
  for (const key of TRACKING_KEYS) {
    const value = params.get(key);
    if (value) captured[key] = value;
  }
  if (Object.keys(captured).length === 0) return readStorage();

  const existing = readStorage();
  const next: ClientAttributionState = {
    firstTouch: existing?.firstTouch && Object.keys(existing.firstTouch).length > 0 ? existing.firstTouch : captured,
    lastTouch: captured,
    capturedAt: new Date().toISOString(),
    expiresAt: Date.now() + THIRTY_DAYS_MS,
  };
  persistStorage(next);
  return next;
}

export function getClientAttributionPayload() {
  const state = readStorage();
  return {
    attribution_first_touch: state?.firstTouch ?? {},
    attribution_last_touch: state?.lastTouch ?? {},
  };
}
