import Link from "next/link";
import type { Metadata } from "next";
import { requireStaffPortal } from "@/lib/admin-guard";
import {
  getOperationalReadinessSections,
  type ReadinessTone,
} from "@/lib/env/operational-readiness";
import { Badge } from "@/components/ui/badge";
import type { BadgeTone } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Launch readiness | Nature OT Growth OS",
};

function toneToBadge(tone: ReadinessTone): BadgeTone {
  switch (tone) {
    case "complete":
      return "success";
    case "needs_setup":
      return "danger";
    case "dry_run_only":
      return "sky";
    case "warning":
      return "warning";
    case "blocked":
      return "danger";
    default:
      return "neutral";
  }
}

const DISPLAY: Record<ReadinessTone, string> = {
  complete: "Complete",
  needs_setup: "Needs setup",
  dry_run_only: "Dry-run only",
  warning: "Warning",
  blocked: "Blocked",
};

const SECTION_TITLES: Record<string, string> = {
  infrastructure: "Environment",
  complianceSafety: "Compliance & safety",
  launchContent: "Launch content",
  automations: "Automations",
  adminWorkflows: "Admin workflows",
};

export default async function LaunchReadinessPage() {
  await requireStaffPortal();
  const sections = getOperationalReadinessSections();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">
          Launch readiness checklist
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-bark/80">
          Status cues track environment posture — they are not clinical compliance sign-offs. Dry-run badges
          are expected while integrations are staged.
        </p>
        <p className="mt-3 text-xs text-bark/70">
          Operational env reference:{" "}
          <code className="rounded bg-cream px-1">/.env.example</code>
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(sections).map(([key, rows]) => (
          <section key={key} className="rounded-2xl border border-sand bg-white/92 p-4 shadow-sm">
            <h2 className="font-display text-xl text-forest">
              {SECTION_TITLES[key] ?? key}
            </h2>
            <ul className="mt-4 divide-y divide-sand/80">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-2 py-3 text-sm md:flex-row md:items-start md:justify-between"
                >
                  <div>
                    <p className="font-medium text-forest">{row.label}</p>
                    {row.detail && (
                      <p className="mt-1 text-xs text-bark/80">{row.detail}</p>
                    )}
                  </div>
                  <Badge tone={toneToBadge(row.tone)} className="self-start capitalize md:self-center">
                    {DISPLAY[row.tone]}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="text-xs text-bark/70">
        After toggling env vars, rerun{" "}
        <Link href="/admin/airtable" className="underline-offset-4 hover:underline">
          Airtable dry-runs
        </Link>
        ,
        <Link href="/admin/zapier" className="underline-offset-4 hover:underline">
          {" "}
          Zapier previews
        </Link>
        , and the public quiz/workshop captures in a sandbox project.
      </p>
    </div>
  );
}
