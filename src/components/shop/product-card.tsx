import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ProductVisual } from "@/components/ui/product-visual";
import { formatPrice } from "@/lib/format";
import {
  categoryLabel,
  primaryImage,
  secondaryImage,
  stockLabel,
} from "@/lib/shop/product";
import type { Product } from "@/types/shop";
import { QuickAdd } from "./quick-add";

export function ProductCard({
  product,
  priority = false,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
}: {
  product: Product;
  priority?: boolean;
  sizes?: string;
}) {
  const front = primaryImage(product);
  const back = secondaryImage(product);
  const stock = stockLabel(product);
  const soldOut = product.status === "sold_out";

  return (
    <article className="group relative">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative overflow-hidden">
          <ProductVisual
            seed={product.slug}
            src={front?.image_url ?? null}
            alt={front?.alt ?? `${product.name} — front`}
            label={product.name}
            frame="front"
            priority={priority}
            sizes={sizes}
            className={`aspect-4/5 w-full transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] ${
              soldOut ? "opacity-60" : ""
            }`}
          />
          <ProductVisual
            seed={product.slug}
            src={back?.image_url ?? null}
            alt={back?.alt ?? `${product.name} — detail`}
            label={product.name}
            frame="detail"
            sizes={sizes}
            className="absolute inset-0 aspect-4/5 w-full opacity-0 transition-opacity duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100"
          />

          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between">
            <Badge value={product.badge} />
            {stock && !product.badge ? (
              <span className="os-label bg-void/70 px-2 py-1 text-[0.5625rem] text-bone backdrop-blur-sm">
                {stock}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="pointer-events-none absolute inset-x-0 bottom-[5.5rem] hidden translate-y-2 opacity-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 lg:block">
        <QuickAdd product={product} />
      </div>

      <div className="pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="os-label text-[0.6875rem]">
            <Link href={`/shop/${product.slug}`} className="os-underline">
              {product.name}
            </Link>
          </h3>
          <p className="flex items-baseline gap-2 text-xs tabular-nums">
            {product.compare_at_price ? (
              <span className="text-[0.6875rem] text-smoke line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            ) : null}
            <span className={product.compare_at_price ? "text-signal" : ""}>
              {formatPrice(product.price)}
            </span>
          </p>
        </div>
        <p className="mt-1.5 text-[0.6875rem] tracking-wide text-smoke uppercase">
          {product.subtitle ?? categoryLabel(product.category)}
        </p>
      </div>
    </article>
  );
}
