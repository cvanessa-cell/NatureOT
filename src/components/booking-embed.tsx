"use client";

import { useEffect, useState } from "react";
import { captureClientAttributionFromUrl, getClientAttributionPayload } from "@/lib/marketing/client-attribution";

export function BookingEmbed() {
  useEffect(() => {
    captureClientAttributionFromUrl();
  }, []);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const url = process.env.NEXT_PUBLIC_BOOKING_EMBED_URL;

  async function confirmBooking() {
    if (!email.trim()) {
      setNote("Add the email you used on the form so we can pause reminders.");
      return;
    }
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, provider: "manual", ...getClientAttributionPayload() }),
    });
    if (res.ok) {
      setNote("Thank you — we will align this with your intake email.");
    } else {
      setNote("We could not match that email yet. You can still email us directly.");
    }
  }

  return (
    <div className="space-y-6">
      {url ? (
        <div className="overflow-hidden rounded-2xl border border-sage/20 bg-white shadow-sm">
          <iframe
            title="Schedule a call"
            src={url}
            className="h-[720px] w-full"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <p className="font-medium">Booking embed not configured</p>
          <p className="mt-2 text-sm">
            Set <code className="rounded bg-white px-1">NEXT_PUBLIC_BOOKING_EMBED_URL</code>{" "}
            to your Cal.com or Calendly link.
          </p>
        </div>
      )}
      <div className="rounded-2xl border border-sage/20 bg-cream/50 p-6">
        <p className="text-sm text-bark">
          After you book, tell us the email you used for your intake so we can
          stop automated follow-up reminders for that address.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="grid flex-1 gap-2 text-sm font-medium text-forest">
            Email on file
            <input
              className="min-h-12 rounded-xl border border-sand bg-white px-4"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@email.com"
            />
          </label>
          <button
            type="button"
            onClick={confirmBooking}
            className="min-h-12 rounded-full bg-sage px-6 font-medium text-cream"
          >
            I booked — update my reminders
          </button>
        </div>
        {note && <p className="mt-3 text-sm text-sage">{note}</p>}
      </div>
    </div>
  );
}
