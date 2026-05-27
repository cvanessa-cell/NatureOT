import { createServerSupabase } from "@/lib/supabase/server";
import { getEnv } from "@/lib/env";

export type PortalRole = "owner" | "admin" | "staff";

/** Owner / Admin / env allowlist — can run privileged ops + Airtable writes after approval. */
export async function getPrivilegedSession() {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { user: null, privileged: false as const };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { user: null, privileged: false as const };

  const allow = (getEnv().ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length && allow.includes(user.email.toLowerCase())) {
    return { user, privileged: true as const };
  }

  const { data: sp } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (sp?.role === "admin" || sp?.role === "owner") {
    return { user, privileged: true as const };
  }
  return { user, privileged: false as const };
}

/** Owner / Admin / Staff — can view operational dashboards (RLS allows SELECT). */
export async function getStaffPortalSession() {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { user: null, portalRole: null };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { user: null, portalRole: null };

  const { privileged, user: u } = await getPrivilegedSession();
  if (privileged && u) {
    const { data: sp } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", u.id)
      .maybeSingle();
    const pr =
      sp?.role === "owner"
        ? ("owner" as const)
        : sp?.role === "admin"
          ? ("admin" as const)
          : ("admin" as const);
    return { user: u, portalRole: pr };
  }

  const { data: sp } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (sp?.role === "staff") {
    return { user, portalRole: "staff" as const };
  }

  return { user, portalRole: null };
}

/** @deprecated use getPrivilegedSession */
export async function getAdminFromSession() {
  const { user, privileged } = await getPrivilegedSession();
  return { user, admin: privileged };
}
