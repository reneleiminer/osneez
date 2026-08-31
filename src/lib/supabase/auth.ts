import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { getSupabaseAdminClient } from "./admin";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "./config";
import type { StaffRole } from "@/types/settings";

/**
 * Cookie-bound Supabase client for the session.
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
 * Owner-level bootstrap. Keeps the shop owner from locking themselves out by
 * editing the staff table, and is the only way in before that table exists.
 */
function bootstrapEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export type AdminSection =
  | "overview"
  | "products"
  | "collections"
  | "drops"
  | "world"
  | "orders"
  | "newsletter"
  | "discounts"
  | "reports"
  | "shipping"
  | "returns"
  | "legal"
  | "settings"
  | "staff";

const ACCESS: Record<StaffRole, AdminSection[] | "*"> = {
  owner: "*",
  editor: [
    "overview",
    "products",
    "collections",
    "drops",
    "world",
    "discounts",
    "legal",
  ],
  fulfilment: ["overview", "orders", "returns"],
};

export function canAccess(role: StaffRole, section: AdminSection): boolean {
  const allowed = ACCESS[role];
  return allowed === "*" || allowed.includes(section);
}

export type AdminSession = { user: User; email: string; role: StaffRole };

async function staffRole(email: string): Promise<StaffRole | null> {
  const db = getSupabaseAdminClient();
  if (!db) return null;
  try {
    const { data, error } = await db
      .from("staff")
      .select("role, active")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    if (!data || data.active === false) return null;
    return data.role as StaffRole;
  } catch (error) {
    // Table may not exist yet — bootstrap access still works.
    console.error("[osneez] could not read staff role:", error);
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createAuthClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const email = user.email.toLowerCase();
  if (bootstrapEmails().includes(email)) {
    return { user, email, role: "owner" };
  }

  const role = await staffRole(email);
  return role ? { user, email, role } : null;
}

/** Redirects to the login screen unless the caller is staff. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Redirects away when the role does not cover this section. */
export async function requireSection(
  section: AdminSection,
): Promise<AdminSession> {
  const session = await requireAdmin();
  if (!canAccess(session.role, section)) redirect("/admin?denied=1");
  return session;
}

export function adminIsConfigured(): boolean {
  return isSupabaseConfigured() && bootstrapEmails().length > 0;
}
