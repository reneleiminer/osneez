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

export type DiscountKind = "percent" | "amount";

export interface Discount {
  id: string;
  code: string;
  description: string | null;
  kind: DiscountKind;
  /** percent: 1–100. amount: cents. */
  value: number;
  min_subtotal: number | null;
  max_redemptions: number | null;
  expires_at: string | null;
  active: boolean;
  stripe_coupon_id: string | null;
  stripe_promotion_code_id: string | null;
  times_redeemed: number;
  created_at: string;
}

export type StaffRole = "owner" | "editor" | "fulfilment";

export interface StaffMember {
  id: string;
  email: string;
  name: string | null;
  role: StaffRole;
  active: boolean;
  created_at: string;
}
