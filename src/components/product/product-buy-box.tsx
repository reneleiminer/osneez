"use client";

import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/format";
import {
  defaultSize,
  isPurchasable,
  primaryImage,
  stockLabel,
  variantForSize,
} from "@/lib/shop/product";
import type { Product } from "@/types/shop";
import { SizeGuide } from "./size-guide";

export function ProductBuyBox({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(() => defaultSize(product));
  const [error, setError] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const purchasable = isPurchasable(product);
  const selected = size ? variantForSize(product, size) : undefined;
  const stock = stockLabel(product);
  const image = primaryImage(product)?.image_url ?? null;

  function addToBag() {
    if (!purchasable) return;
    if (!selected) {
      setError("Bitte wähle eine Größe.");
      return;
    }
    if (selected.stock === 0) {
      setError("Diese Größe ist ausverkauft.");
      return;
    }
    setError(null);
    add({
      productId: product.id,
      slug: product.slug,
      size: selected.size,
      quantity: 1,
      name: product.name,
      color: selected.color,
      price: product.price,
      image,
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <p className="flex items-baseline gap-3 text-base tabular-nums">
          {product.compare_at_price ? (
            <span className="text-sm text-smoke line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          ) : null}
          <span className={product.compare_at_price ? "text-signal" : ""}>
            {formatPrice(product.price)}
          </span>
        </p>
        <p className="text-[0.6875rem] text-smoke">inkl. MwSt.</p>
        {stock ? (
          <p className="os-label ml-auto text-[0.625rem] text-signal">{stock}</p>
        ) : null}
      </div>

      <div className="mt-8">
        <p className="os-eyebrow">Colour</p>
        <p className="mt-2 text-xs tracking-wide uppercase">
          {product.variants[0]?.color ?? product.subtitle ?? "—"}
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="os-eyebrow">Size</p>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="os-label os-underline py-1 text-[0.625rem] text-smoke"
          >
            Size guide
          </button>
        </div>

        <div
          role="radiogroup"
          aria-label="Größe wählen"
          className="mt-3 flex flex-wrap gap-2"
        >
          {product.variants.map((variant) => {
            const disabled = variant.stock === 0 || !purchasable;
            return (
              <button
                key={variant.id}
                type="button"
                role="radio"
                aria-checked={size === variant.size}
                disabled={disabled}
                onClick={() => {
                  setSize(variant.size);
                  setError(null);
                }}
                data-active={size === variant.size}
                className="os-label min-w-14 border os-rule px-3 py-3 text-[0.625rem] transition-colors hover:border-bone data-[active=true]:border-bone data-[active=true]:bg-bone data-[active=true]:text-void disabled:cursor-not-allowed disabled:border-bone/5 disabled:text-steel disabled:line-through disabled:hover:border-bone/5"
              >
                {variant.size}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-xs text-signal">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={addToBag}
        disabled={!purchasable}
        className="os-btn os-btn-signal mt-8 w-full"
      >
        {product.status === "coming_soon"
          ? "Coming soon"
          : purchasable
            ? "Add to bag"
            : "Sold out"}
        {purchasable ? <span aria-hidden="true">→</span> : null}
      </button>

      {!purchasable ? (
        <p className="mt-4 text-[0.6875rem] leading-relaxed text-smoke">
          {product.status === "coming_soon"
            ? "Dieses Piece kommt mit dem nächsten Drop. Trag dich in den Inner Circle ein, um vor allen anderen zu erfahren, wann es live geht."
            : "Dieser Run ist durch. Restocks kündigen wir zuerst im Inner Circle an."}
        </p>
      ) : null}

      <SizeGuide
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        category={product.category}
      />
    </div>
  );
}
