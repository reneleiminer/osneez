import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "./config";

let readClient: SupabaseClient | null = null;

/**
 * Anonymous, read-only client for public catalogue data.
 * Returns null when Supabase is not configured so callers can fall back.
 */
export function getSupabaseReadClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  readClient ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return readClient;
}
