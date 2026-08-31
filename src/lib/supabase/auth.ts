import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "./config";

/**
 * Cookie-bound Supabase client for the admin session.
 *
 * Server Components cannot write cookies, so `setAll` is allowed to fail
 * there — the session is refreshed the next time a Server Action runs.
 */
export async function createAuthClient() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          /* read-only cookie store inside a Server Component */
        }
      },
    },
  });
}

/**
 * Allowlist of admin addresses. Fails closed: with ADMIN_EMAILS unset nobody
 * gets in, even with valid Supabase credentials.
 */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminUser(): Promise<User | null> {
  const supabase = await createAuthClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;
  const allowed = adminEmails();
  if (!allowed.includes(user.email.toLowerCase())) return null;
  return user;
}

/** Redirects to the login screen unless the caller is an allowlisted admin. */
export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

export function adminIsConfigured(): boolean {
  return isSupabaseConfigured() && adminEmails().length > 0;
}
