import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/shop/product-grid";
import {
  getCollectionBySlug,
  getCollections,
  getProducts,
} from "@/lib/shop/queries";

export const revalidate = 300;

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection nicht gefunden" };
  return {
    title: collection.name,
    description: collection.description ?? undefined,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: {
      title: `${collection.name} — OSNEEZ®`,
      description: collection.description ?? undefined,
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const products = await getProducts({ collectionSlug: collection.slug });

  return (
    <div className="os-edge py-14 lg:py-20">
      <header className="border-b os-rule pb-8">
        <p className="os-eyebrow text-signal">Collection</p>
        <h1 className="os-display mt-4 text-[clamp(2.75rem,10vw,7.5rem)] leading-[0.8]">
          {collection.name}
        </h1>
        {collection.description ? (
          <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-smoke">
            {collection.description}
          </p>
        ) : null}
      </header>

      <ProductGrid products={products} className="mt-12" />
    </div>
  );
}
