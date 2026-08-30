import { Reveal } from "@/components/motion/reveal";
import type { Product } from "@/types/shop";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  className = "",
  priorityCount = 2,
}: {
  products: Product[];
  className?: string;
  priorityCount?: number;
}) {
  if (!products.length) {
    return (
      <div className="border os-rule px-6 py-20 text-center">
        <p className="os-display text-3xl">Nothing here yet.</p>
        <p className="mx-auto mt-3 max-w-[38ch] text-sm leading-relaxed text-smoke">
          Diese Auswahl ist gerade leer. Der nächste Drop ist in Arbeit — trag
          dich in den Inner Circle ein, dann bist du zuerst dran.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4 ${className}`}
    >
      {products.map((product, index) => (
        <Reveal key={product.id} delay={(index % 4) * 90}>
          <ProductCard product={product} priority={index < priorityCount} />
        </Reveal>
      ))}
    </div>
  );
}
