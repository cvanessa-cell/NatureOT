import { createAdminClient } from "@/lib/supabase/admin";

export async function logEmailEvent(row: {
  lead_id?: string | null;
  template_key: string;
  dispatch_status: "queued" | "sent" | "dry_run" | "failed" | "skipped_no_provider";
  resend_email_id?: string | null;
  provider?: string;
  related_table?: string | null;
  related_record_id?: string | null;
  error_message?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  await supabase.from("email_events").insert({
    lead_id: row.lead_id ?? null,
    template_key: row.template_key,
    provider: row.provider ?? "resend",
    dispatch_status: row.dispatch_status,
    resend_email_id: row.resend_email_id ?? null,
    related_table: row.related_table ?? null,
    related_record_id: row.related_record_id ?? null,
    error_message: row.error_message ?? null,
    sent_at: row.dispatch_status === "sent" ? now : null,
    event_type: row.dispatch_status === "dry_run" ? "dry_run" : row.template_key,
    metadata: (row.metadata ?? {}) as never,
  });
}
