import { requireStaffPortal } from "@/lib/admin-guard";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Settings | Nature OT Growth OS",
};

export default async function AdminSettingsPage() {
  await requireStaffPortal();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">
          Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-bark/80">
          Placeholder fields map to environment variables and Supabase configuration in production deployments.
        </p>
        <div className="mt-4">
          <Link
            href="/admin/settings/launch-readiness"
            className="inline-flex min-h-12 items-center rounded-full bg-sky/90 px-6 text-sm font-semibold text-cream shadow-sm transition hover:bg-sky"
          >
            Open launch readiness checklist
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl text-forest">
            Practice information
          </h2>
          <div className="mt-4 space-y-3">
            <label className="grid gap-1 text-sm font-medium text-forest">
              Practice display name
              <Input defaultValue="Nature OT Growth OS" readOnly />
            </label>
            <label className="grid gap-1 text-sm font-medium text-forest">
              Primary service region
              <Input placeholder="Texas" readOnly />
            </label>
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-xl text-forest">
            CTAs & booking
          </h2>
          <div className="mt-4 space-y-3">
            <label className="grid gap-1 text-sm font-medium text-forest">
              Booking embed URL
              <Input placeholder="NEXT_PUBLIC_BOOKING_EMBED_URL" readOnly />
            </label>
            <label className="grid gap-1 text-sm font-medium text-forest">
              Public app URL
              <Input placeholder="NEXT_PUBLIC_APP_URL" readOnly />
            </label>
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-xl text-forest">
            Email & SMS
          </h2>
          <p className="mt-2 text-sm text-bark/80">
            Configure <code className="rounded bg-white px-1">RESEND_API_KEY</code>,{" "}
            <code className="rounded bg-white px-1">EMAIL_FROM</code>, and Twilio variables server-side.
          </p>
        </Card>
        <Card>
          <h2 className="font-display text-xl text-forest">
            Integrations
          </h2>
          <p className="mt-2 text-sm text-bark/80">
            Airtable and Zapier keys remain server-only—never commit secrets.
          </p>
          <label className="mt-4 grid gap-1 text-sm font-medium text-forest">
            Parent guide asset URL override
            <Input placeholder="PARENT_GUIDE_ASSET_URL | optional CDN/pdf" readOnly />
          </label>
          <label className="mt-4 grid gap-1 text-sm font-medium text-forest">
            Parent guide delivery mode
            <Input placeholder="public_asset | signed_url | signed_url_future" readOnly />
          </label>
          <label className="mt-4 grid gap-1 text-sm font-medium text-forest">
            Supabase Storage (signed_url mode)
            <Input
              placeholder="PARENT_GUIDE_STORAGE_BUCKET + PARENT_GUIDE_STORAGE_PATH + expires"
              readOnly
            />
          </label>
          <label className="mt-4 grid gap-1 text-sm font-medium text-forest">
            Public asset path fallback
            <Input placeholder="PARENT_GUIDE_PUBLIC_ASSET_PATH (default guides/html)" readOnly />
          </label>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-display text-xl text-forest">
            Compliance language
          </h2>
          <label className="mt-4 grid gap-1 text-sm font-medium text-forest">
            Disclaimer snippet (site-wide reference)
            <Textarea
              readOnly
              defaultValue="Educational information only; not a substitute for individualized occupational therapy evaluation."
            />
          </label>
        </Card>
      </div>
    </div>
  );
}
