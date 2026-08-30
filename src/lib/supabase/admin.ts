import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_URL, isSupabaseAdminConfigured } from "./config";

let adminClient: SupabaseClient | null = null;

/**
 * Service-role client. Server-only, never imported into a client component.
 * Used for privileged writes: newsletter signups and Stripe order sync.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured()) return null;
  adminClient ??= createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return adminClient;
}
