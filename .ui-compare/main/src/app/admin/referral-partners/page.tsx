import { requireStaffPortal, getAdminDb } from "@/lib/admin-guard";
import type { Metadata } from "next";
import { samplePartners, referralPartnerTypes } from "@/lib/mock/admin-sample-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CampaignAuthenticityCompact } from "@/components/admin/campaign-authenticity-rules";

export const metadata: Metadata = {
  title: "Referral partners | Nature OT Growth OS",
};

export const dynamic = "force-dynamic";

type InquiryRow = {
  id: string;
  organization_name: string;
  contact_name: string;
  email: string;
  partner_type: string | null;
  city: string | null;
  status: string;
  created_at: string;
};

export default async function AdminReferralPartnersPage() {
  await requireStaffPortal();

  let inquiries: InquiryRow[] = [];
  try {
    const db = getAdminDb();
    const { data } = await db
      .from("referral_inquiries")
      .select(
        "id, organization_name, contact_name, email, partner_type, city, status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(50);
    inquiries = (data as InquiryRow[] | null) ?? [];
  } catch {
    /* sample */
  }

  const useLive = inquiries.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">
          Referral partners
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-bark/80">
          Partner types: {referralPartnerTypes.join(", ")}. Keep outreach operational—no student/patient
          identifiers in marketing exports. Incoming inquiry forms hydrate the first table below when
          available.
        </p>
      </div>

      <CampaignAuthenticityCompact />

      <div className="overflow-x-auto rounded-2xl border border-sand bg-white shadow-sm">
        <table className="min-w-[880px] w-full text-left text-sm">
          <thead className="border-b border-sand bg-cream/60 text-forest">
            <tr>
              <th className="px-3 py-3 font-medium">Organization</th>
              <th className="px-3 py-3 font-medium">Contact</th>
              <th className="px-3 py-3 font-medium">Type</th>
              <th className="px-3 py-3 font-medium">City</th>
              {useLive ? (
                <>
                  <th className="px-3 py-3 font-medium">Email</th>
                  <th className="px-3 py-3 font-medium">Submitted</th>
                </>
              ) : (
                <>
                  <th className="px-3 py-3 font-medium">Follow-up due</th>
                  <th className="px-3 py-3 font-medium">Referrals</th>
                </>
              )}
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {useLive &&
              inquiries.map((q) => (
                <tr key={q.id} className="border-t border-sand/70">
                  <td className="px-3 py-3">{q.organization_name}</td>
                  <td className="px-3 py-3">{q.contact_name}</td>
                  <td className="px-3 py-3">{q.partner_type ?? "—"}</td>
                  <td className="px-3 py-3">{q.city ?? "—"}</td>
                  <td className="px-3 py-3 break-all">{q.email}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-bark/70 tabular-nums">
                    {new Date(q.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={q.status === "new" ? "warning" : "sage"}>{q.status}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-2">
                      <Button type="button" variant="outline" className="!min-h-8 !text-xs">
                        Log interaction
                      </Button>
                      <Button type="button" variant="ghost" className="!min-h-8 !text-xs">
                        Draft intro email
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            {!useLive &&
              samplePartners.map((p) => (
                <tr key={p.id} className="border-t border-sand/70">
                  <td className="px-3 py-3">{p.org}</td>
                  <td className="px-3 py-3">{p.contact}</td>
                  <td className="px-3 py-3">{p.type}</td>
                  <td className="px-3 py-3">{p.city}</td>
                  <td className="px-3 py-3 tabular-nums">{p.followUpDue}</td>
                  <td className="px-3 py-3 tabular-nums">{p.referrals}</td>
                  <td className="px-3 py-3">
                    <Badge tone={p.status === "follow_up" ? "warning" : "sage"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-2">
                      <Button type="button" variant="outline" className="!min-h-8 !text-xs">
                        Log interaction
                      </Button>
                      <Button type="button" variant="ghost" className="!min-h-8 !text-xs">
                        Draft intro email
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!useLive && (
        <p className="text-xs text-bark/60">
          Showing curated rehearsal partners until Supabase receives referral inquiries from the public
          form.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl text-forest">
            Follow-up due queue
          </h2>
          <p className="mt-2 text-sm text-bark/85">
            Surface partners without contact in 14 days (rule placeholder).
          </p>
          <Button type="button" className="mt-4" variant="secondary">
            Build quarterly update list
          </Button>
        </Card>
        <Card>
          <h2 className="font-display text-xl text-forest">
            Interaction timeline
          </h2>
          <p className="mt-2 text-sm text-bark/85">
            Wire to your CRM / Supabase events when operational logging is enabled.
          </p>
        </Card>
      </div>
    </div>
  );
}
