"use client";

import { nanoid } from "nanoid";

type FbqEventName = "Lead" | "Schedule" | "CompleteRegistration";

type Fbq = (
  command: "track",
  eventName: FbqEventName,
  parameters?: Record<string, unknown>,
  options?: { eventID?: string }
) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

export function createMetaEventId(prefix = "meta"): string {
  return `${prefix}_${nanoid()}`;
}

export function trackMetaEvent(
  eventName: FbqEventName,
  eventId: string,
  parameters: Record<string, unknown> = {}
) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", eventName, parameters, { eventID: eventId });
}
