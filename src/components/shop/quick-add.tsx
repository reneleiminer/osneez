"use client";

import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { isPurchasable, primaryImage } from "@/lib/shop/product";
import type { Product } from "@/types/shop";

export function QuickAdd({ product }: { product: Product }) {
  const { add } = useCart();
  const [expanded, setExpanded] = useState(false);

  if (!isPurchasable(product)) return null;

  const image = primaryImage(product)?.image_url ?? null;

  return (
    <div className="relative">
      {expanded ? (
        <div className="flex flex-wrap gap-1 bg-void/90 p-2 backdrop-blur-sm">
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              disabled={variant.stock === 0}
              onClick={() => {
                add({
                  productId: product.id,
                  slug: product.slug,
                  size: variant.size,
                  quantity: 1,
                  name: product.name,
                  color: variant.color,
                  price: product.price,
                  image,
                });
                setExpanded(false);
              }}
              className="os-label border os-rule px-2.5 py-1.5 text-[0.5625rem] transition-colors hover:border-bone hover:bg-bone hover:text-void disabled:cursor-not-allowed disabled:text-steel disabled:hover:bg-transparent disabled:hover:text-steel"
            >
              {variant.size}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="os-label w-full bg-bone/95 py-2.5 text-[0.5625rem] text-void backdrop-blur-sm transition-colors hover:bg-signal hover:text-paper"
        >
          Quick add
        </button>
      )}
    </div>
  );
}
