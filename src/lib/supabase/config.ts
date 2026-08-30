export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * The storefront runs fine without Supabase — it falls back to the bundled
 * seed catalogue. Every data helper checks this first so a missing env var
 * never turns into a runtime crash.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Public storage buckets used for brand and product media. */
export const STORAGE_BUCKETS = {
  products: "products",
  collections: "collections",
  campaigns: "campaigns",
  world: "world",
} as const;

export function storagePublicUrl(
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string,
): string | null {
  if (!SUPABASE_URL || !path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKETS[bucket]}/${path}`;
}
