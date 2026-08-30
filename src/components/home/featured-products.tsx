import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { ProductCard } from "@/components/shop/product-card";
import type { Product } from "@/types/shop";

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section
      aria-labelledby="featured-heading"
      className="border-t os-rule bg-void"
    >
      <div className="os-edge py-20 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b os-rule pb-5">
          <div>
            <p className="os-eyebrow text-signal">02 / Selected</p>
            <h2
              id="featured-heading"
              className="os-display mt-3 text-[clamp(2.25rem,6vw,4.5rem)]"
            >
              The pieces
              <br />
              people ask about.
            </h2>
          </div>
          <Link href="/shop" className="os-label os-underline text-[0.6875rem]">
            View all
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
          {products.slice(0, 4).map((product, index) => (
            <Reveal key={product.id} delay={index * 90}>
              <ProductCard
                product={product}
                priority={index < 2}
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
