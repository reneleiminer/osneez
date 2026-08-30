import type { CategorySlug } from "@/types/shop";

export const SITE = {
  name: "OSNEEZ",
  legalName: "OSNEEZ",
  tagline: "Built after dark.",
  title: "OSNEEZ® — Streetwear Built After Dark",
  description:
    "Independent streetwear shaped by motorcycles, nights and the streets. Limited runs, heavy fabrics, no idle.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://osneez.vercel.app",
  locale: "de_DE",
  email: "hello@osneez.com",
  instagram: "https://instagram.com/osneez",
  tiktok: "https://tiktok.com/@osneez",
} as const;

/** Free shipping threshold in cents. */
export const FREE_SHIPPING_THRESHOLD = 12_000;

/** Flat shipping rate in cents below the threshold. */
export const SHIPPING_RATE = 490;

export const SHIPPING_COUNTRIES = [
  "AT",
  "BE",
  "CH",
  "CZ",
  "DE",
  "DK",
  "ES",
  "FI",
  "FR",
  "IT",
  "LU",
  "NL",
  "PL",
  "PT",
  "SE",
] as const;

export const ANNOUNCEMENTS = [
  "FREE SHIPPING DE FROM €120",
  "DROP 001 — AVAILABLE NOW",
  "SHIPPED WITHIN 48H",
] as const;

export const PRIMARY_NAV = [
  { label: "Shop", href: "/shop" },
  { label: "Drops", href: "/drops" },
  { label: "Collections", href: "/collections" },
  { label: "World", href: "/world" },
  { label: "About", href: "/about" },
] as const;

export const FOOTER_NAV = {
  shop: [
    { label: "All products", href: "/shop" },
    { label: "Tees", href: "/shop?category=tees" },
    { label: "Hoodies", href: "/shop?category=hoodies" },
    { label: "Zipper", href: "/shop?category=zipper" },
    { label: "Bottoms", href: "/shop?category=bottoms" },
    { label: "Accessories", href: "/shop?category=accessories" },
  ],
  brand: [
    { label: "Drop 001", href: "/drops/drop-001" },
    { label: "Collections", href: "/collections" },
    { label: "OSNEEZ World", href: "/world" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "Imprint", href: "/imprint" },
  ],
} as const;

export const CATEGORIES: {
  slug: CategorySlug;
  label: string;
  line: string;
}[] = [
  { slug: "tees", label: "Tees", line: "Heavyweight cotton, boxy cut." },
  { slug: "hoodies", label: "Hoodies", line: "480 gsm, built for cold rides." },
  { slug: "zipper", label: "Zipper", line: "Full-zip layers for the in-between." },
  { slug: "bottoms", label: "Bottoms", line: "Joggers and denim in progress." },
  { slug: "accessories", label: "Accessories", line: "Caps, gloves, small hardware." },
];

export const MARQUEE_WORDS = [
  "OSNEEZ",
  "DROP 001",
  "RIDE LOUD",
  "STREETWEAR",
  "AFTER DARK",
  "NO IDLE",
  "MOTOR DIVISION",
] as const;

/**
 * Hero media is intentionally env-driven so final campaign assets can be
 * swapped in without touching component code. Leave unset to render the
 * built-in cinematic placeholder.
 */
export const HERO_MEDIA = {
  video: process.env.NEXT_PUBLIC_HERO_VIDEO_URL ?? null,
  poster: process.env.NEXT_PUBLIC_HERO_POSTER_URL ?? null,
} as const;
