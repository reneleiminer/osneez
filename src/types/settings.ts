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

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  sort_order: number;
  active: boolean;
}

export interface ShippingRate {
  id: string;
  zone_id: string;
  name: string;
  description: string | null;
  /** Cents. */
  price: number;
  free_over: number | null;
  min_subtotal: number | null;
  max_subtotal: number | null;
  delivery_min_days: number;
  delivery_max_days: number;
  sort_order: number;
  active: boolean;
}

/** A rate resolved for a concrete country and cart value. */
export interface ResolvedRate {
  id: string;
  zone: string;
  name: string;
  description: string | null;
  /** Cents, already zeroed when the free-shipping threshold is met. */
  amount: number;
  free: boolean;
  freeOver: number | null;
  deliveryMinDays: number;
  deliveryMaxDays: number;
}

export type ReturnStatus =
  | "requested"
  | "approved"
  | "received"
  | "refunded"
  | "rejected";

export interface ReturnRequest {
  id: string;
  order_id: string | null;
  order_reference: string | null;
  email: string;
  reason: string | null;
  items: string | null;
  status: ReturnStatus;
  admin_note: string | null;
  created_at: string;
}
