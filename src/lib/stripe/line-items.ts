import "server-only";

import type Stripe from "stripe";

import { getProductBySlug } from "@/lib/shop/queries";
import { variantForSize } from "@/lib/shop/product";
import type { CartLine } from "@/types/shop";

export type LineItemResult =
  | { ok: true; lineItems: Stripe.Checkout.SessionCreateParams.LineItem[]; subtotal: number }
  | { ok: false; error: string };

/**
 * Rebuilds Stripe line items from the database. Prices, availability and
 * stock come exclusively from the server — the client only sends slug, size
 * and quantity.
 */
export async function buildLineItems(
  items: CartLine[],
): Promise<LineItemResult> {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await getProductBySlug(item.slug);
    if (!product || !product.active || product.status !== "active") {
      return { ok: false, error: `"${item.slug}" ist aktuell nicht bestellbar.` };
    }

    const variant = variantForSize(product, item.size);
    if (!variant || !variant.active) {
      return {
        ok: false,
        error: `Größe ${item.size} ist für ${product.name} nicht verfügbar.`,
      };
    }

    if (variant.stock < item.quantity) {
      return {
        ok: false,
        error:
          variant.stock === 0
            ? `${product.name} (${item.size}) ist ausverkauft.`
            : `Von ${product.name} (${item.size}) sind nur noch ${variant.stock} verfügbar.`,
      };
    }

    subtotal += product.price * item.quantity;
    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: "eur",
        // Storefront prices are shown as VAT-inclusive consumer prices.
        tax_behavior: "inclusive",
        unit_amount: product.price,
        product_data: {
          name: `${product.name}${product.subtitle ? ` — ${product.subtitle}` : ""}`,
          description: `Größe ${variant.size} · ${variant.color}`,
          metadata: {
            product_id: product.id,
            slug: product.slug,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
          },
        },
      },
    });
  }

  if (!lineItems.length) return { ok: false, error: "Dein Warenkorb ist leer." };
  return { ok: true, lineItems, subtotal };
}
