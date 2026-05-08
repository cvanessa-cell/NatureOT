import { createAdminClient } from "@/lib/supabase/admin";

export async function writeAuditLog(entry: {
  actor?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip?: string | null;
}) {
  try {
    const supabase = createAdminClient();
    await supabase.from("audit_logs").insert({
      actor: entry.actor ?? "system",
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId ?? null,
      details: entry.details ?? {},
      ip: entry.ip ?? null,
    });
  } catch (e) {
    console.error("[audit]", e);
  }
}
