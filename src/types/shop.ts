export type ProductStatus = "active" | "coming_soon" | "sold_out" | "archived";

export type ProductBadge = "NEW" | "LIMITED" | "RESTOCK" | "SOLD OUT" | "UPCOMING" | null;

export type ProductImageType = "front" | "back" | "detail" | "lifestyle";

export type CategorySlug =
  | "tees"
  | "hoodies"
  | "zipper"
  | "bottoms"
  | "accessories";

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt: string;
  sort_order: number;
  type: ProductImageType;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  active: boolean;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  active: boolean;
  sort_order: number;
}

export interface Drop {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  release_date: string | null;
  hero_image: string | null;
  hero_video: string | null;
  active: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  /** Gross price in cents (EUR, VAT inclusive). */
  price: number;
  compare_at_price: number | null;
  description: string | null;
  material: string | null;
  fit: string | null;
  details: string | null;
  active: boolean;
  featured: boolean;
  status: ProductStatus;
  category: CategorySlug;
  collection_id: string | null;
  drop_id: string | null;
  badge: ProductBadge;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface WorldStory {
  id: string;
  slug: string;
  title: string;
  location: string;
  timestamp_label: string;
  excerpt: string;
  cover_image: string | null;
  published_at: string;
}

export interface CartLine {
  slug: string;
  size: string;
  quantity: number;
}

export interface CartLineView extends CartLine {
  productId: string;
  name: string;
  color: string;
  /** Cached for instant UI only — never trusted server-side. */
  price: number;
  image: string | null;
}

/** Slim product projection handed to the client-side search overlay. */
export interface SearchItem {
  slug: string;
  name: string;
  subtitle: string | null;
  price: number;
  category: CategorySlug;
  image: string | null;
  status: ProductStatus;
}
