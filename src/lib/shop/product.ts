import type { Product, ProductVariant } from "@/types/shop";
import { CATEGORIES } from "@/lib/site";

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((entry) => entry.slug === slug)?.label ?? slug;
}

export function productHref(product: Pick<Product, "slug">): string {
  return `/shop/${product.slug}`;
}

export function isPurchasable(product: Product): boolean {
  return (
    product.active &&
    product.status === "active" &&
    product.variants.some((variant) => variant.stock > 0)
  );
}

export function variantForSize(
  product: Product,
  size: string,
): ProductVariant | undefined {
  return product.variants.find((variant) => variant.size === size);
}

export function defaultSize(product: Product): string | null {
  const inStock = product.variants.find((variant) => variant.stock > 0);
  return inStock?.size ?? product.variants[0]?.size ?? null;
}

export function totalStock(product: Product): number {
  return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
}

export function stockLabel(product: Product): string | null {
  if (product.status === "coming_soon") return "Coming soon";
  if (product.status === "sold_out" || totalStock(product) === 0)
    return "Sold out";
  const stock = totalStock(product);
  if (stock <= 8) return `Only ${stock} left`;
  return null;
}

export function primaryImage(product: Product) {
  return (
    product.images.find((image) => image.type === "front") ??
    product.images[0] ??
    null
  );
}

export function secondaryImage(product: Product) {
  const primary = primaryImage(product);
  return (
    product.images.find(
      (image) => image.id !== primary?.id && image.type !== "front",
    ) ?? null
  );
}

/**
 * Stable 32-bit hash used to derive deterministic placeholder artwork so a
 * product always renders the same generated frame across server and client.
 */
export function visualSeed(key: string): number {
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}
