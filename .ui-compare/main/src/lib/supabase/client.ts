import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)"
    );
  }
  return createBrowserClient(url, key);
}
