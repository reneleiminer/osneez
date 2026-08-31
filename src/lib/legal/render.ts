import { formatPrice } from "@/lib/format";
import type { LegalSlug, Settings } from "@/types/settings";

export type RenderedSection = { heading: string; paragraphs: string[] };

/** Fields still unset stay visible as a placeholder instead of vanishing. */
function missing(label: string): string {
  return `[${label}]`;
}

function tokenMap(settings: Settings): Record<string, string> {
  const deliveryDays = `${settings.delivery_min_days}–${settings.delivery_max_days}`;

  return {
    legal_name:
      [settings.legal_form, settings.legal_name].filter(Boolean).join(" ") ||
      missing("Firmenname"),
    street: settings.street ?? missing("Straße und Hausnummer"),
    postal_code: settings.postal_code ?? missing("PLZ"),
    city: settings.city ?? missing("Ort"),
    country: settings.country ?? missing("Land"),
    representative: settings.representative ?? missing("Vertretungsberechtigte Person"),
    register_court: settings.register_court ?? missing("Registergericht"),
    register_number: settings.register_number ?? missing("Registernummer"),
    vat_id: settings.vat_id ?? missing("USt-IdNr."),
    responsible_person:
      settings.responsible_person ??
      settings.representative ??
      missing("Verantwortliche Person"),
    contact_email: settings.contact_email ?? missing("E-Mail-Adresse"),
    support_email:
      settings.support_email ?? settings.contact_email ?? missing("E-Mail-Adresse"),
    press_email: settings.press_email ?? settings.contact_email ?? missing("E-Mail-Adresse"),
    phone: settings.phone ?? missing("Telefonnummer"),
    free_shipping: formatPrice(settings.free_shipping_threshold),
    shipping_rate: formatPrice(settings.shipping_rate),
    delivery_days: deliveryDays,
    countries: settings.shipping_countries.join(", "),
    tax_note: settings.small_business
      ? "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet."
      : "",
  };
}

export function resolveTokens(text: string, settings: Settings): string {
  const tokens = tokenMap(settings);
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in tokens ? tokens[key] : match,
  );
}

/**
 * Splits the stored body into sections. A line starting with "## " opens a new
 * section; blank lines separate paragraphs inside it.
 */
export function parseLegalBody(
  body: string,
  settings: Settings,
): RenderedSection[] {
  const resolved = resolveTokens(body, settings);
  const sections: RenderedSection[] = [];
  let current: RenderedSection | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (!current) return;
    const text = buffer.join("\n").trim();
    if (text) current.paragraphs.push(...text.split(/\n{2,}/).map((p) => p.trim()));
    buffer = [];
  };

  for (const line of resolved.split(/\r?\n/)) {
    if (line.startsWith("## ")) {
      flush();
      if (current) sections.push(current);
      current = { heading: line.slice(3).trim(), paragraphs: [] };
    } else {
      buffer.push(line);
    }
  }
  flush();
  if (current) sections.push(current);

  // Drop paragraphs that resolved to nothing (e.g. an empty tax note).
  return sections
    .map((section) => ({
      ...section,
      paragraphs: section.paragraphs.filter(Boolean),
    }))
    .filter((section) => section.heading || section.paragraphs.length);
}

export function legalHref(slug: LegalSlug): string {
  return `/${slug}`;
}
