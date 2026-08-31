import "server-only";

import { getSupabaseReadClient } from "@/lib/supabase/server";
import {
  ANNOUNCEMENTS,
  FREE_SHIPPING_THRESHOLD,
  HERO_MEDIA,
  SHIPPING_COUNTRIES,
  SHIPPING_RATE,
  SITE,
} from "@/lib/site";
import type { Settings } from "@/types/settings";

/**
 * Fallback used before the settings row exists — mirrors the constants the
 * storefront shipped with, so nothing breaks when Supabase is absent.
 */
export const DEFAULT_SETTINGS: Settings = {
  legal_name: null,
  legal_form: null,
  street: null,
  postal_code: null,
  city: null,
  country: "Deutschland",
  representative: null,
  register_court: null,
  register_number: null,
  vat_id: null,
  small_business: false,
  responsible_person: null,

  contact_email: null,
  support_email: null,
  press_email: null,
  phone: null,

  announcements: [...ANNOUNCEMENTS],
  instagram_url: SITE.instagram,
  tiktok_url: SITE.tiktok,
  hero_video_url: HERO_MEDIA.video,
  hero_image_url: HERO_MEDIA.poster,

  free_shipping_threshold: FREE_SHIPPING_THRESHOLD,
  shipping_rate: SHIPPING_RATE,
  shipping_countries: [...SHIPPING_COUNTRIES],
  delivery_min_days: 2,
  delivery_max_days: 5,

  payment_methods: [],
  automatic_tax: true,
  promotion_codes: true,
  invoice_creation: true,
};

function normalise(row: Partial<Settings> | null): Settings {
  if (!row) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...row,
    // Empty arrays in the database must not blank out the storefront.
    announcements: row.announcements?.length
      ? row.announcements
      : DEFAULT_SETTINGS.announcements,
    shipping_countries: row.shipping_countries?.length
      ? row.shipping_countries
      : DEFAULT_SETTINGS.shipping_countries,
    payment_methods: row.payment_methods ?? [],
  };
}

export async function getSettings(): Promise<Settings> {
  const client = getSupabaseReadClient();
  if (!client) return DEFAULT_SETTINGS;
  try {
    const { data, error } = await client
      .from("settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();
    if (error) throw error;
    return normalise(data as Partial<Settings> | null);
  } catch (error) {
    console.error("[osneez] could not load settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/** Postal address as a single formatted block, empty parts skipped. */
export function formatAddress(settings: Settings): string[] {
  return [
    settings.legal_name,
    settings.street,
    [settings.postal_code, settings.city].filter(Boolean).join(" ") || null,
    settings.country,
  ].filter((line): line is string => Boolean(line && line.trim()));
}

export function isCompanyComplete(settings: Settings): boolean {
  return Boolean(
    settings.legal_name &&
      settings.street &&
      settings.postal_code &&
      settings.city &&
      settings.contact_email,
  );
}
