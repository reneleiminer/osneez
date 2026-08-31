export type LegalSlug =
  | "imprint"
  | "privacy"
  | "terms"
  | "returns"
  | "shipping";

export interface Settings {
  legal_name: string | null;
  legal_form: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  representative: string | null;
  register_court: string | null;
  register_number: string | null;
  vat_id: string | null;
  small_business: boolean;
  responsible_person: string | null;

  contact_email: string | null;
  support_email: string | null;
  press_email: string | null;
  phone: string | null;

  announcements: string[];
  instagram_url: string | null;
  tiktok_url: string | null;
  hero_video_url: string | null;
  hero_image_url: string | null;

  /** Cents. */
  free_shipping_threshold: number;
  /** Cents. */
  shipping_rate: number;
  shipping_countries: string[];
  delivery_min_days: number;
  delivery_max_days: number;

  /** Empty = let Stripe pick from the dashboard configuration. */
  payment_methods: string[];
  automatic_tax: boolean;
  promotion_codes: boolean;
  invoice_creation: boolean;
}

export interface LegalPageRecord {
  slug: LegalSlug;
  title: string;
  intro: string | null;
  body: string;
  draft: boolean;
}

/** Fields the storefront may expose to the browser. */
export interface PublicSettings {
  freeShippingThreshold: number;
  shippingRate: number;
}
