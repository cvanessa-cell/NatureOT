import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv, getSupabaseUrl } from "@/lib/env";

let _admin: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (_admin) return _admin;
  const url = getSupabaseUrl();
  const env = getEnv();
  if (!url || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase URL (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required"
    );
  }
  _admin = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}
