"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setMessage("Sign-in failed. Check that Supabase is configured.");
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-sand bg-white/80 p-8 shadow-sm">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl text-forest">
        Admin sign in
      </h1>
      <p className="mt-2 text-sm text-bark/80">
        Uses Supabase Auth. Privileged actions need{" "}
        <code className="rounded bg-cream px-1">ADMIN_EMAILS</code> or{" "}
        <code className="rounded bg-cream px-1">profiles.role</code> owner/admin.
        Staff can view select dashboards via RLS.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="grid gap-1 text-sm font-medium text-forest">
          Email
          <input
            type="email"
            required
            autoComplete="username"
            className="min-h-12 rounded-xl border border-sand px-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-forest">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            className="min-h-12 rounded-xl border border-sand px-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {message && (
          <p className="text-sm text-red-800" role="alert">
            {message}
          </p>
        )}
        <button
          type="submit"
          className="min-h-12 w-full rounded-full bg-forest font-medium text-cream"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
