import { createAdminClient } from "@/lib/supabase/admin";

export async function getMarketingDashboardStats({ startDate, endDate }: { startDate: string; endDate: string }) {
  const supabase = createAdminClient();
  const [leads, guides, waitlist, workshops, unsubscribes, failedSends] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", startDate).lte("created_at", endDate),
    supabase.from("lead_lifecycle_events").select("id", { count: "exact", head: true }).eq("lifecycle_stage", "guide_downloaded").gte("created_at", startDate).lte("created_at", endDate),
    supabase.from("lead_lifecycle_events").select("id", { count: "exact", head: true }).eq("lifecycle_stage", "waitlist_joined").gte("created_at", startDate).lte("created_at", endDate),
    supabase.from("lead_lifecycle_events").select("id", { count: "exact", head: true }).eq("lifecycle_stage", "workshop_registered").gte("created_at", startDate).lte("created_at", endDate),
    supabase.from("lead_lifecycle_events").select("id", { count: "exact", head: true }).eq("lifecycle_stage", "unsubscribed").gte("created_at", startDate).lte("created_at", endDate),
    supabase.from("marketing_messages").select("id", { count: "exact", head: true }).eq("status", "failed").gte("created_at", startDate).lte("created_at", endDate),
  ]);

  return {
    totalLeads: leads.count ?? 0,
    guideDownloads: guides.count ?? 0,
    waitlistJoins: waitlist.count ?? 0,
    workshopRegistrations: workshops.count ?? 0,
    unsubscribes: unsubscribes.count ?? 0,
    failedSends: failedSends.count ?? 0,
  };
}

export async function getCampaignPerformance(campaignId: string) {
  const supabase = createAdminClient();
  const { data: attribLeads } = await supabase
    .from("lead_attribution_events")
    .select("lead_id")
    .eq("campaign_id", campaignId);
  const leadIds = [...new Set((attribLeads ?? []).map((r) => r.lead_id).filter(Boolean))] as string[];

  const [{ data: campaign }, { count: leadCount }, { count: conversionCount }] = await Promise.all([
    supabase.from("marketing_campaigns").select("*").eq("id", campaignId).single(),
    supabase.from("lead_attribution_events").select("id", { count: "exact", head: true }).eq("campaign_id", campaignId),
    leadIds.length === 0
      ? Promise.resolve({ count: 0 })
      : supabase
          .from("lead_lifecycle_events")
          .select("id", { count: "exact", head: true })
          .in("lifecycle_stage", ["call_booked", "converted_client"])
          .in("lead_id", leadIds),
  ]);
  return {
    campaign,
    leadCount: leadCount ?? 0,
    conversionCount: conversionCount ?? 0,
  };
}

export type MarketingSyncHealth = {
  zapierLastAt: string | null;
  zapierLastResult: string | null;
  zapierLastKey: string | null;
  zapierLastFailureAt: string | null;
  zapierLastFailureMessage: string | null;
  airtablePending: number;
  airtableFailed: number;
};

export async function getMarketingSyncHealth(): Promise<MarketingSyncHealth> {
  const supabase = createAdminClient();
  const [
    { data: lastZap },
    { data: lastZapFail },
    { count: airtablePending },
    { count: airtableFailed },
  ] = await Promise.all([
    supabase
      .from("zapier_events")
      .select("created_at,result,error_message,related_zap_key")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("zapier_events")
      .select("created_at,result,error_message,related_zap_key")
      .eq("result", "failed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("airtable_sync_jobs").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("airtable_sync_jobs").select("id", { count: "exact", head: true }).eq("status", "failed"),
  ]);

  const lz = lastZap as {
    created_at?: string | null;
    result?: string | null;
    error_message?: string | null;
    related_zap_key?: string | null;
  } | null;
  const lzf = lastZapFail as {
    created_at?: string | null;
    error_message?: string | null;
  } | null;

  return {
    zapierLastAt: lz?.created_at ?? null,
    zapierLastResult: lz?.result ?? null,
    zapierLastKey: lz?.related_zap_key ?? null,
    zapierLastFailureAt: lzf?.created_at ?? null,
    zapierLastFailureMessage: lzf?.error_message ?? null,
    airtablePending: airtablePending ?? 0,
    airtableFailed: airtableFailed ?? 0,
  };
}

export async function getFunnelMetrics({ startDate, endDate }: { startDate: string; endDate: string }) {
  const supabase = createAdminClient();
  const [{ count: attribution }, { count: leads }, { count: nurtured }, { count: booked }, { count: converted }] = await Promise.all([
    supabase.from("lead_attribution_events").select("id", { count: "exact", head: true }).gte("created_at", startDate).lte("created_at", endDate),
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", startDate).lte("created_at", endDate),
    supabase.from("marketing_sequence_enrollments").select("id", { count: "exact", head: true }).gte("started_at", startDate).lte("started_at", endDate),
    supabase.from("lead_lifecycle_events").select("id", { count: "exact", head: true }).eq("lifecycle_stage", "call_booked").gte("created_at", startDate).lte("created_at", endDate),
    supabase.from("lead_lifecycle_events").select("id", { count: "exact", head: true }).eq("lifecycle_stage", "converted_client").gte("created_at", startDate).lte("created_at", endDate),
  ]);
  return { attribution: attribution ?? 0, leads: leads ?? 0, nurtured: nurtured ?? 0, booked: booked ?? 0, converted: converted ?? 0 };
}

export async function getSourceBreakdown({ startDate, endDate }: { startDate: string; endDate: string }) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("lead_attribution_events")
    .select("utm_source, utm_medium")
    .gte("created_at", startDate)
    .lte("created_at", endDate);
  const grouped = new Map<string, number>();
  for (const row of data ?? []) {
    const key = `${row.utm_source ?? "unknown"} / ${row.utm_medium ?? "unknown"}`;
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }
  return Array.from(grouped.entries()).map(([sourceMedium, count]) => ({ sourceMedium, count }));
}

export async function getSequencePerformance(sequenceId: string) {
  const supabase = createAdminClient();
  const [{ count: enrollments }, { count: completed }, { count: sent }, { count: failed }, { count: skipped }] = await Promise.all([
    supabase.from("marketing_sequence_enrollments").select("id", { count: "exact", head: true }).eq("sequence_id", sequenceId),
    supabase.from("marketing_sequence_enrollments").select("id", { count: "exact", head: true }).eq("sequence_id", sequenceId).eq("status", "completed"),
    supabase.from("marketing_messages").select("id", { count: "exact", head: true }).eq("sequence_id", sequenceId).eq("status", "sent"),
    supabase.from("marketing_messages").select("id", { count: "exact", head: true }).eq("sequence_id", sequenceId).eq("status", "failed"),
    supabase.from("marketing_messages").select("id", { count: "exact", head: true }).eq("sequence_id", sequenceId).eq("status", "skipped"),
  ]);
  return { enrollments: enrollments ?? 0, completed: completed ?? 0, sent: sent ?? 0, failed: failed ?? 0, skipped: skipped ?? 0 };
}

export async function getReferralPartnerStats() {
  const supabase = createAdminClient();
  const [{ data: partners }, { count: overdueTasks }] = await Promise.all([
    supabase.from("referral_partners").select("status"),
    supabase.from("partner_outreach_tasks").select("id", { count: "exact", head: true }).eq("status", "todo").lte("due_at", new Date().toISOString()),
  ]);
  const grouped = new Map<string, number>();
  for (const partner of partners ?? []) {
    grouped.set(partner.status, (grouped.get(partner.status) ?? 0) + 1);
  }
  return { byStatus: Array.from(grouped.entries()).map(([status, count]) => ({ status, count })), overdueTasks: overdueTasks ?? 0 };
}

export async function getContentCalendarStats() {
  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();
  const [{ count: total }, { count: upcoming }] = await Promise.all([
    supabase.from("content_calendar_posts").select("id", { count: "exact", head: true }),
    supabase.from("content_calendar_posts").select("id", { count: "exact", head: true }).gte("publish_at", nowIso).in("status", ["approved", "scheduled"]),
  ]);
  return { total: total ?? 0, upcoming: upcoming ?? 0 };
}

export async function getCommunityEventStats() {
  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();
  const [{ count: total }, { count: upcoming }] = await Promise.all([
    supabase.from("community_events").select("id", { count: "exact", head: true }),
    supabase.from("community_events").select("id", { count: "exact", head: true }).gte("start_at", nowIso).in("status", ["planned", "promoting"]),
  ]);
  return { total: total ?? 0, upcoming: upcoming ?? 0 };
}
