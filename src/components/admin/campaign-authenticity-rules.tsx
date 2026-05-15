import Link from "next/link";
import { ComplianceBanner } from "@/components/marketing/compliance-banner";
import {
  ADMIN_APPROVAL_GATES,
  ALLOWED_CAMPAIGN_CREATIONS,
  BLOCKED_CAMPAIGN_PRACTICES,
  CAMPAIGN_AUTHENTICITY_SUMMARY,
  FORBIDDEN_CAMPAIGN_CREATIONS,
  PUBLIC_ATTRIBUTION_SOURCES,
} from "@/lib/campaign-authenticity";
import { Card } from "@/components/ui/card";

export function CampaignAuthenticityCompact() {
  return (
    <ComplianceBanner>
      <p>{CAMPAIGN_AUTHENTICITY_SUMMARY}</p>
      <p className="mt-2">
        <Link
          href="/admin/campaign-policy"
          className="font-medium text-forest underline-offset-4 hover:underline"
        >
          Full campaign authenticity policy
        </Link>
      </p>
    </ComplianceBanner>
  );
}

export function CampaignAuthenticityRulesFull() {
  return (
    <div className="space-y-6">
      <ComplianceBanner>
        <p className="font-medium text-forest">Operational requirement</p>
        <p className="mt-1">{CAMPAIGN_AUTHENTICITY_SUMMARY}</p>
      </ComplianceBanner>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-[family-name:var(--font-fraunces)] text-xl text-forest">
            Must not create
          </h2>
          <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-bark/90">
            {FORBIDDEN_CAMPAIGN_CREATIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="font-[family-name:var(--font-fraunces)] text-xl text-forest">
            May create
          </h2>
          <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-bark/90">
            {ALLOWED_CAMPAIGN_CREATIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl text-forest">
          Public-facing attribution
        </h2>
        <p className="mt-2 text-sm text-bark/80">
          Every public promotion must clearly come from one of:
        </p>
        <ol className="mt-3 list-inside list-decimal space-y-1.5 text-sm text-bark/90">
          {PUBLIC_ATTRIBUTION_SOURCES.map((s) => (
            <li key={s.id}>{s.label}</li>
          ))}
        </ol>
      </Card>

      <Card className="p-6">
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl text-forest">
          System must block
        </h2>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-bark/90">
          {BLOCKED_CAMPAIGN_PRACTICES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl text-forest">
          Admin approval gates
        </h2>
        <p className="mt-2 text-sm text-bark/80">
          These actions require explicit review before they can go live:
        </p>
        <ul className="mt-4 space-y-3">
          {ADMIN_APPROVAL_GATES.map((g) => (
            <li key={g.id} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span className="font-medium text-forest">{g.label}</span>
              <Link
                href={g.adminRoute}
                className="text-moss hover:underline"
              >
                Open module
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
