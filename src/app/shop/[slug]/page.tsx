import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductAccordion } from "@/components/product/product-accordion";
import { ProductBuyBox } from "@/components/product/product-buy-box";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductCard } from "@/components/shop/product-card";
import { Badge } from "@/components/ui/badge";
import { categoryLabel, primaryImage, totalStock } from "@/lib/shop/product";
import { getProductBySlug, getProducts } from "@/lib/shop/queries";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produkt nicht gefunden" };

  const image = primaryImage(product)?.image_url;
  return {
    title: `${product.name}${product.subtitle ? ` — ${product.subtitle}` : ""}`,
    description: product.description ?? SITE.description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} — OSNEEZ®`,
      description: product.description ?? SITE.description,
      url: `${SITE.url}/shop/${product.slug}`,
      // Only override the generated card when real photography exists —
      // an explicit `undefined` would suppress the file-based OG image.
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getProducts({ category: product.category }))
    .filter((entry) => entry.slug !== product.slug)
    .slice(0, 4);

  const inStock = totalStock(product) > 0 && product.status === "active";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: "OSNEEZ" },
    category: categoryLabel(product.category),
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (product.price / 100).toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE.url}/shop/${product.slug}`,
    },
  };

  return (
    <div className="os-edge py-8 lg:py-12">
      <script
        type="application/ld+json"
        // Static, server-generated product data only.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="os-label text-[0.625rem] text-smoke">
        <Link href="/shop" className="os-underline inline-block py-1">
          Shop
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <Link href={`/shop?category=${product.category}`} className="os-underline inline-block py-1">
          {categoryLabel(product.category)}
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span className="text-bone">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* min-w-0 keeps the horizontal image rail from stretching the grid */}
        <div className="min-w-0 lg:col-span-7">
          <ProductGallery product={product} />
        </div>

        <div className="min-w-0 lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="os-display text-[clamp(2.25rem,6vw,3.75rem)] leading-[0.85]">
                  {product.name}
                </h1>
                {product.subtitle ? (
                  <p className="mt-2 text-xs tracking-wide text-smoke uppercase">
                    {product.subtitle}
                  </p>
                ) : null}
              </div>
              <Badge value={product.badge} className="mt-2 shrink-0" />
            </div>

            {product.description ? (
              <p className="mt-6 max-w-[48ch] text-sm leading-relaxed text-smoke">
                {product.description}
              </p>
            ) : null}

            <div className="mt-8">
              <ProductBuyBox product={product} />
            </div>

            <ProductAccordion product={product} />
          </div>
        </div>
      </div>

      {related.length ? (
        <section aria-labelledby="related-heading" className="mt-24">
          <div className="flex items-end justify-between border-b os-rule pb-5">
            <h2 id="related-heading" className="os-display text-3xl">
              More {categoryLabel(product.category)}
            </h2>
            <Link href="/shop" className="os-label os-underline text-[0.625rem]">
              View all
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
            {related.map((entry) => (
              <ProductCard key={entry.id} product={entry} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
