"use client";

import { useEffect, useMemo, useState } from "react";
import Cal from "@calcom/embed-react";
import type { PrefillAndIframeAttrsConfig } from "@calcom/embed-core";
import { captureClientAttributionFromUrl, getClientAttributionPayload } from "@/lib/marketing/client-attribution";
import { createMetaEventId, trackMetaEvent } from "@/lib/meta/client-events";

const CAL_THEME = {
  cssVarsPerTheme: {
    light: {
      "cal-brand": "#163F2A",
      "cal-brand-emphasis": "#0F2F20",
      "cal-brand-text": "#FFFFFF",
      "cal-text": "#163F2A",
      "cal-text-emphasis": "#182B20",
      "cal-border": "#e8e0d4",
      "cal-bg": "#FFFCF4",
      "cal-bg-emphasis": "#F7F3E8",
    },
  },
  theme: "light" as const,
  hideEventTypeDetails: false,
  layout: "month_view" as const,
};

function parseCalLink(raw: string): string | null {
  try {
    const u = new URL(raw);
    return u.pathname.replace(/^\//, "");
  } catch {
    return raw.replace(/^\//, "") || null;
  }
}

export function BookingScheduler() {
  useEffect(() => {
    captureClientAttributionFromUrl();
  }, []);

  const rawUrl = process.env.NEXT_PUBLIC_BOOKING_EMBED_URL;
  const calLink = useMemo(() => (rawUrl ? parseCalLink(rawUrl) : null), [rawUrl]);

  if (!calLink) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <p className="font-medium">Booking embed not configured</p>
        <p className="mt-2 text-sm">
          Set <code className="rounded bg-white px-1">NEXT_PUBLIC_BOOKING_EMBED_URL</code>{" "}
          to your Cal.com or Calendly link.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-sage/20 bg-card/95 shadow-sm">
      <Cal
        namespace="book-call"
        calLink={calLink}
        config={CAL_THEME as unknown as PrefillAndIframeAttrsConfig}
        style={{ width: "100%", height: "100%", overflow: "scroll", minHeight: "720px" }}
      />
    </div>
  );
}

export function BookingReminderForm() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function confirmBooking() {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNote("Please enter a valid email address.");
      setStatus("error");
      return;
    }
    const metaEventId = createMetaEventId("booking");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        provider: "manual",
        meta_event_id: metaEventId,
        ...getClientAttributionPayload(),
      }),
    });
    if (res.ok) {
      trackMetaEvent("Schedule", metaEventId, { content_name: "Parent call" });
      setNote("Done — we will align reminders with your booking email.");
      setStatus("success");
    } else {
      setNote("We could not match that email yet. You can still email us directly.");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-sage/20 bg-cream/50 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="grid flex-1 gap-2 text-sm font-medium text-forest">
          Email used to book
          <input
            className="min-h-12 rounded-xl border border-sand bg-white px-4 text-forest placeholder:text-bark/50"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== "idle") setStatus("idle");
              if (note) setNote(null);
            }}
            placeholder="parent@email.com"
            aria-describedby="reminder-status"
          />
        </label>
        <button
          type="button"
          onClick={confirmBooking}
          className="min-h-12 rounded-full bg-sage px-6 font-medium text-cream transition hover:bg-sage/90"
        >
          Update My Reminders
        </button>
      </div>
      {note && (
        <p
          id="reminder-status"
          role="status"
          className={`mt-3 text-sm ${status === "success" ? "text-moss" : "text-terracotta"}`}
        >
          {note}
        </p>
      )}
    </div>
  );
}

/** @deprecated Use BookingScheduler and BookingReminderForm separately */
export function BookingEmbed() {
  return (
    <div className="space-y-6">
      <BookingScheduler />
      <BookingReminderForm />
    </div>
  );
}
