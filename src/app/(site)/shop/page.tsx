import type { Metadata } from "next";

import { CategoryFilter } from "@/components/shop/category-filter";
import { ProductGrid } from "@/components/shop/product-grid";
import { getProducts } from "@/lib/shop/queries";
import { CATEGORIES } from "@/lib/site";
import type { CategorySlug } from "@/types/shop";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Alle OSNEEZ Pieces aus Drop 001 — Tees, Hoodies, Zipper, Bottoms und Accessories. Kleine Runs, schwere Stoffe.",
  alternates: { canonical: "/shop" },
};

function parseCategory(value: string | undefined): CategorySlug | null {
  const match = CATEGORIES.find((category) => category.slug === value);
  return match?.slug ?? null;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = parseCategory(category);
  const products = await getProducts({ category: active });
  const label = active
    ? (CATEGORIES.find((entry) => entry.slug === active)?.label ?? "Shop")
    : "All pieces";

  return (
    <div className="os-edge py-14 lg:py-20">
      <header className="border-b os-rule pb-8">
        <p className="os-eyebrow text-signal">Shop</p>
        <h1 className="os-display mt-4 text-[clamp(3rem,11vw,8rem)] leading-[0.8]">
          {label}
        </h1>
        <p className="mt-6 max-w-[46ch] text-sm leading-relaxed text-smoke">
          Alles, was gerade lieferbar ist. Was ausverkauft ist, bleibt sichtbar —
          Restocks kündigen wir zuerst im Inner Circle an.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <CategoryFilter active={active} />
        <p className="os-label text-[0.625rem] text-smoke">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      <ProductGrid products={products} className="mt-4" />
    </div>
  );
}
