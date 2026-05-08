import { redirect } from "next/navigation";
import {
  getPrivilegedSession,
  getStaffPortalSession,
} from "@/lib/auth-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requirePrivileged() {
  const { user, privileged } = await getPrivilegedSession();
  if (!privileged || !user) {
    redirect("/admin/login");
  }
  return { user };
}

export async function requireStaffPortal() {
  const { user, portalRole } = await getStaffPortalSession();
  if (!user || !portalRole) {
    redirect("/admin/login");
  }
  return { user, portalRole };
}

export function getAdminDb() {
  return createAdminClient();
}

/** @deprecated use requirePrivileged */
export async function requireAdmin() {
  return requirePrivileged();
}
