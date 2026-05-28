import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Automations | TreeTots Growth Engine",
};

export const dynamic = "force-dynamic";

export default async function MarketingAutomationsPage() {
  await requireStaffPortal();
  const db = getAdminDb();

  let sequences: Array<{ id: string; name: string; trigger_type: string; status: string }> = [];
  try {
    const { data } = await db
      .from("marketing_sequences")
      .select("id,name,trigger_type,status")
      .order("name", { ascending: true });
    sequences = data ?? [];
  } catch {
    sequences = [];
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-forest">Automations</h1>
          <p className="mt-2 max-w-3xl text-sm text-bark/80">
            Email sequences, Zapier bridges, and cron jobs. External sends stay behind approval unless explicitly enabled.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/sequences">
            <Button type="button" variant="outline">
              Email sequences (legacy)
            </Button>
          </Link>
          <Link href="/admin/zapier">
            <Button type="button" variant="outline">
              Zapier catalog
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <p className="text-sm font-medium text-forest">Marketing sequences (Supabase)</p>
        <ul className="mt-4 space-y-3">
          {sequences.length === 0 && (
            <li className="text-sm text-bark/75">No sequences found. Run marketing migrations on Supabase.</li>
          )}
          {sequences.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sand bg-white/70 px-4 py-3"
            >
              <div>
                <p className="font-medium text-forest">{s.name}</p>
                <p className="text-xs text-bark/70">Trigger: {s.trigger_type}</p>
              </div>
              <Badge tone={s.status === "active" ? "success" : "sage"}>{s.status}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <p className="text-sm font-medium text-forest">Safety rules</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-bark/85">
          <li>No auto-posting to social or groups.</li>
          <li>No auto-DMs to referral partners.</li>
          <li>Keep external email sends behind explicit approval unless you intentionally enable auto-send.</li>
        </ul>
      </Card>
    </div>
  );
}
