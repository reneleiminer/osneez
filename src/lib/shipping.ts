import "server-only";

import { getSupabaseReadClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import type { ResolvedRate, ShippingRate, ShippingZone } from "@/types/settings";

type ZoneWithRates = ShippingZone & { rates: ShippingRate[] };

/**
 * Zones with their rates. Returns an empty list when the tables do not exist
 * yet — callers then fall back to the single flat rate from the settings.
 */
export async function getShippingZones(): Promise<ZoneWithRates[]> {
  const client = getSupabaseReadClient();
  if (!client) return [];
  try {
    const { data, error } = await client
      .from("shipping_zones")
      .select("*, rates:shipping_rates(*)")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return ((data ?? []) as unknown as ZoneWithRates[]).map((zone) => ({
      ...zone,
      rates: (zone.rates ?? [])
        .filter((rate) => rate.active)
        .sort((a, b) => a.sort_order - b.sort_order),
    }));
  } catch (error) {
    console.error("[osneez] could not load shipping zones:", error);
    return [];
  }
}

function applies(rate: ShippingRate, subtotal: number): boolean {
  if (rate.min_subtotal !== null && subtotal < rate.min_subtotal) return false;
  if (rate.max_subtotal !== null && subtotal > rate.max_subtotal) return false;
  return true;
}

/**
 * Every rate offered for a destination at a given cart value, cheapest first.
 * Falls back to the flat rate from the settings when no zone matches, so the
 * checkout can never end up with zero options.
 */
export async function ratesForCountry(
  country: string,
  subtotal: number,
): Promise<ResolvedRate[]> {
  const code = country.trim().toUpperCase();
  const zones = await getShippingZones();
  const zone = zones.find((entry) => entry.countries.includes(code));

  const resolve = (rate: ShippingRate, zoneName: string): ResolvedRate => {
    const free = rate.free_over !== null && subtotal >= rate.free_over;
    return {
      id: rate.id,
      zone: zoneName,
      name: rate.name,
      description: rate.description,
      amount: free ? 0 : rate.price,
      free,
      freeOver: rate.free_over,
      deliveryMinDays: rate.delivery_min_days,
      deliveryMaxDays: rate.delivery_max_days,
    };
  };

  if (zone) {
    const rates = zone.rates
      .filter((rate) => applies(rate, subtotal))
      .map((rate) => resolve(rate, zone.name));
    if (rates.length) return rates.sort((a, b) => a.amount - b.amount);
  }

  // No zone configured (or none matched) — use the flat settings rate.
  const settings = await getSettings();
  const free = subtotal >= settings.free_shipping_threshold;
  return [
    {
      id: "settings-default",
      zone: "Standard",
      name: free ? "Kostenloser Versand" : "Standardversand",
      description: null,
      amount: free ? 0 : settings.shipping_rate,
      free,
      freeOver: settings.free_shipping_threshold,
      deliveryMinDays: settings.delivery_min_days,
      deliveryMaxDays: settings.delivery_max_days,
    },
  ];
}

/** Union of every country covered by a zone, plus the settings list. */
export async function shippableCountries(): Promise<string[]> {
  const [zones, settings] = await Promise.all([
    getShippingZones(),
    getSettings(),
  ]);
  const codes = new Set<string>(settings.shipping_countries);
  for (const zone of zones) {
    for (const code of zone.countries) codes.add(code.toUpperCase());
  }
  return [...codes].sort();
}
