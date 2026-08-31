import "server-only";

import { getSupabaseReadClient } from "@/lib/supabase/server";
import type { LegalPageRecord, LegalSlug } from "@/types/settings";
import { DEFAULT_LEGAL } from "./defaults";

function fallback(slug: LegalSlug): LegalPageRecord {
  const preset = DEFAULT_LEGAL[slug];
  return { slug, ...preset };
}

/** Database content wins; the bundled draft is used until a row exists. */
export async function getLegalPage(slug: LegalSlug): Promise<LegalPageRecord> {
  const client = getSupabaseReadClient();
  if (!client) return fallback(slug);
  try {
    const { data, error } = await client
      .from("legal_pages")
      .select("slug, title, intro, body, draft")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data || !String(data.body ?? "").trim()) return fallback(slug);
    return data as LegalPageRecord;
  } catch (error) {
    console.error(`[osneez] could not load legal page "${slug}":`, error);
    return fallback(slug);
  }
}
