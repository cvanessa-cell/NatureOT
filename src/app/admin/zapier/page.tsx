import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import Link from "next/link";
import type { Metadata } from "next";
import { ZapierDryRunButtons } from "./zapier-dry-run-client";
import type { ZapierAutomationRow } from "./types";
import { zapCatalogue } from "@/lib/mock/admin-sample-data";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Zapier bridge | Nature OT Growth OS",
};

export const dynamic = "force-dynamic";

function safeJson(value: unknown) {
  try {
    const text = JSON.stringify(value ?? {}, null, 2);
    return text.length > 2600 ? `${text.slice(0, 2600)}…` : text;
  } catch {
    return "—";
  }
}

export default async function AdminZapierPage() {
  await requireStaffPortal();
  let automations: ZapierAutomationRow[] = [];
  let recent: Record<string, unknown>[] = [];
  let failed: Record<string, unknown>[] = [];
  const envEnabled = process.env.ZAPIER_ENABLED ?? "(unset)";
  const envDryRun = process.env.ZAPIER_DRY_RUN ?? "(unset)";

  try {
    const db = getAdminDb();

    const [autoRes, recentRes, failRes] = await Promise.all([
      db.from("zapier_automations").select("*").order("zap_key", { ascending: true }),
      db
        .from("zapier_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(35),
      db
        .from("zapier_events")
        .select("*")
        .eq("result", "failed")
        .order("created_at", { ascending: false })
        .limit(15),
    ]);

    automations = (autoRes.data as ZapierAutomationRow[]) ?? [];

    recent = recentRes.data ?? [];
    failed = failRes.data ?? [];
  } catch {
    automations = [];
    recent = [];
    failed = [];
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl text-forest">
          Zapier automation bridge
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-bark/80">
          Supabase remains the operational record store. Zapier relays{" "}
          <span className="font-medium text-forest">minimum necessary</span> data
          between approved tools — never the clinical chart. PHI‑like fields are
          stripped before outbound payloads, inbound posts are audited, and
          approvals gate external sequences (reviews, referrals, scheduler handoffs).
        </p>
        <p className="mt-2 text-xs text-bark/60">
          Lucidchart: map{" "}
          <span className="font-medium">
            Nature OT Growth OS — Zapier Automation Map
          </span>{" "}
          from this catalogue; Airtable tables{" "}
          <span className="font-medium">Zapier Automations</span> &amp;{" "}
          <span className="font-medium">Zapier Run Logs</span> complement this Supabase
          audit.
        </p>
        <p className="mt-1 text-[11px] text-bark/55">
          Server env hints:{" "}
          <code className="rounded bg-white px-1">ZAPIER_ENABLED={envEnabled}</code>{" "}
          ·{" "}
          <code className="rounded bg-white px-1">ZAPIER_DRY_RUN={envDryRun}</code>
        </p>
        <p className="mt-3 text-xs text-bark/75">
          When <code>ZAPIER_ENABLED=false</code>, outbound Catch Hooks never fire — rows still persist with{" "}
          <code>skipped_disabled</code>. When <code>ZAPIER_DRY_RUN=true</code>, live HTTP is suppressed and{" "}
          <code>result=dry_run</code>. Missing webhook URLs log{" "}
          <code>skipped_no_url</code> without impacting public lead forms.
        </p>
      </div>

      <section className="rounded-xl border border-sand bg-white/80 p-4">
        <h2 className="text-lg font-semibold text-forest">Catalogue</h2>
        <p className="mt-1 text-xs text-bark/70">
          Mirrors the seeded automation keys and matches Catch Hook mappings in Zapier.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-xs">
            <thead className="border-b border-sand bg-cream/60 font-medium text-forest">
              <tr>
                <th className="px-3 py-2">Zap key</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Module</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Approval</th>
                <th className="px-3 py-2">External</th>
              </tr>
            </thead>
            <tbody>
              {automations.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-bark/70" colSpan={6}>
                    Could not load `zapier_automations` — run migrations and ensure the
                    service role is configured.
                  </td>
                </tr>
              )}
              {automations.map((a) => (
                <tr key={a.zap_key} className="border-t border-sand/70">
                  <td className="px-3 py-2 font-mono text-[11px]">{a.zap_key}</td>
                  <td className="px-3 py-2">{a.zap_name}</td>
                  <td className="px-3 py-2">{a.related_module ?? "—"}</td>
                  <td className="px-3 py-2">{a.status}</td>
                  <td className="px-3 py-2">{a.requires_approval ? "yes" : "—"}</td>
                  <td className="px-3 py-2">{a.sends_external_message ? "yes" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-dashed border-sage/50 bg-cream/40 p-4">
        <h2 className="text-lg font-semibold text-forest">Design catalogue (reference)</h2>
        <p className="mt-1 max-w-3xl text-xs text-bark/70">
          Cross-check your live <code>zapier_automations</code> rows against this bridge map. Badges describe safety posture for outbound messaging.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-xs">
            <thead className="border-b border-sand bg-white/80 font-medium text-forest">
              <tr>
                <th className="px-3 py-2">Key</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Trigger</th>
                <th className="px-3 py-2">Approval</th>
                <th className="px-3 py-2">External</th>
                <th className="px-3 py-2">PHI risk</th>
                <th className="px-3 py-2">Safety</th>
              </tr>
            </thead>
            <tbody>
              {zapCatalogue.map((z) => (
                <tr key={z.key} className="border-t border-sand/70 bg-white/70">
                  <td className="px-3 py-2 font-mono text-[11px]">{z.key}</td>
                  <td className="px-3 py-2">{z.name}</td>
                  <td className="px-3 py-2">{z.trigger}</td>
                  <td className="px-3 py-2">{z.approval}</td>
                  <td className="px-3 py-2">{z.external}</td>
                  <td className="px-3 py-2">{z.phi}</td>
                  <td className="px-3 py-2">
                    <Badge tone={z.approval.includes("Required") ? "warning" : "sage"}>
                      {z.approval.includes("Required") ? "Approval required" : "Safe operational"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-sky/40 bg-white/85 p-4">
        <h2 className="text-lg font-semibold text-forest">Privileged tools</h2>
        <p className="mt-1 max-w-3xl text-xs text-bark/70">
          Dry-run payloads log to `zapier_events` and respect{" "}
          <code>ZAPIER_DRY_RUN</code>; owner/admin session required via API.
        </p>
        <ZapierDryRunButtons />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-red-200/80 bg-white/85 p-4">
          <h3 className="font-semibold text-forest">Failed / needs review</h3>
          <ul className="mt-3 space-y-2 text-xs text-bark/80">
            {failed.length === 0 && (
              <li>No failed webhook attempts recorded (or migrations pending).</li>
            )}
            {failed.map((f, i) => (
              <li key={String(f.id ?? i)} className="rounded border border-red-100 p-3 text-[11px]">
                <div className="font-mono text-[10px] text-forest">
                  {(f.event_type as string) ?? "event"}
                </div>
                <div className="mt-2 grid gap-1 text-bark/80 md:grid-cols-3">
                  <div>
                    <span className="font-semibold text-bark">Result</span>{" "}
                    <span className="font-mono text-[10px]">{String(f.result)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-bark">Destination</span>{" "}
                    {String(f.destination ?? "—")}
                  </div>
                  <div>
                    <span className="font-semibold text-bark">Approval</span>{" "}
                    {f.approval_required ? String(f.approval_status ?? "") : "not_required"}
                  </div>
                  <div className="md:col-span-3">
                    <span className="font-semibold text-bark">Created</span>{" "}
                    {String(f.created_at)}
                  </div>
                  {f.error_message ? (
                    <div className="md:col-span-3 text-red-800">
                      {String(f.error_message)}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-sand bg-white/85 p-4">
          <h3 className="font-semibold text-forest">Recent audits</h3>
          <ul className="mt-3 space-y-2 text-xs text-bark/80">
            {recent.length === 0 && (
              <li>No Zapier audits yet.</li>
            )}
            {recent.map((ev, idx) => (
              <li
                key={String(ev.id ?? idx)}
                className="rounded border border-sand/70 p-3 text-[11px] text-bark/80"
              >
                <div className="font-mono text-[10px] text-forest">{String(ev.event_type)}</div>
                <div className="mt-2 grid gap-1 md:grid-cols-3">
                  <div>
                    <span className="font-semibold text-bark">Result</span>{" "}
                    <span className="font-mono text-[10px]">{String(ev.result)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-bark">Dry-run?</span>{" "}
                    {String(ev.result) === "dry_run" ? "yes" : "no"}
                  </div>
                  <div>
                    <span className="font-semibold text-bark">Destination</span>{" "}
                    {String(ev.destination ?? "—")}
                  </div>
                  <div className="md:col-span-3">
                    <span className="font-semibold text-bark">Created</span>{" "}
                    {String(ev.created_at)}
                  </div>
                  <div className="md:col-span-3">
                    <span className="font-semibold text-bark">Approval</span>{" "}
                    {ev.approval_required ? String(ev.approval_status ?? "") : "not_required"}
                  </div>
                  {ev.error_message ? (
                    <div className="md:col-span-3 text-red-800">
                      {String(ev.error_message)}
                    </div>
                  ) : null}
                  <details className="md:col-span-3 rounded border border-sand/70 bg-white/70 p-2">
                    <summary className="cursor-pointer text-[11px] font-semibold text-forest">
                      Payload summary preview
                    </summary>
                    <pre className="mt-2 max-h-44 overflow-auto text-[10px] text-bark/80 whitespace-pre-wrap">
                      {safeJson(ev.payload_summary)}
                    </pre>
                  </details>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="text-xs text-bark/60">
        Design reference: Agent_Airtable reasons over Airtable; Zapier moves approved
        automations downstream. Questions? Ping{" "}
        <Link href="/admin/agent-airtable" className="underline-offset-4 hover:underline">
          Agent previews
        </Link>{" "}
        before turning on outbound messaging.
      </p>
    </div>
  );
}
