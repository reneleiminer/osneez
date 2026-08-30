import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { getCollections, getProducts } from "@/lib/shop/queries";
import { visualSeed } from "@/lib/shop/product";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Collections",
  description:
    "AFTERDARK, MOTOR DIVISION und ESSENTIALS — die Linien hinter OSNEEZ.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const collections = await getCollections();
  const products = await getProducts();

  return (
    <div className="os-edge py-14 lg:py-20">
      <header className="border-b os-rule pb-8">
        <p className="os-eyebrow text-signal">Collections</p>
        <h1 className="os-display mt-4 text-[clamp(3rem,11vw,8rem)] leading-[0.8]">
          The lines
        </h1>
        <p className="mt-6 max-w-[46ch] text-sm leading-relaxed text-smoke">
          Drei Linien, ein Ursprung. Jede Kollektion hat einen eigenen Job — von
          täglichen Basics bis zu Pieces, die für die Straße gebaut sind.
        </p>
      </header>

      <ul className="mt-12 grid gap-4 md:grid-cols-2">
        {collections.map((collection, index) => {
          const count = products.filter(
            (product) => product.collection_id === collection.id,
          ).length;
          const hash = visualSeed(collection.slug);
          return (
            <li
              key={collection.id}
              className={index === 0 ? "md:col-span-2" : ""}
            >
              <Reveal delay={index * 90}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="group os-frame flex aspect-4/5 flex-col justify-end p-6 sm:aspect-16/9"
                  style={{
                    backgroundImage: `radial-gradient(80% 65% at ${20 + (hash % 55)}% ${25 + ((hash >> 5) % 50)}%, rgba(228,38,28,0.16) 0%, transparent 58%), linear-gradient(${130 + (hash % 70)}deg, #0d0f13 0%, #21242a 100%)`,
                  }}
                >
                  <span className="absolute inset-0 transition-colors duration-700 group-hover:bg-void/25" />
                  <span className="os-label relative z-10 text-[0.5625rem] text-smoke">
                    {count} {count === 1 ? "piece" : "pieces"}
                  </span>
                  <span className="os-display relative z-10 mt-2 text-[clamp(2.25rem,7vw,5rem)] leading-[0.85] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
                    {collection.name}
                  </span>
                  <span className="relative z-10 mt-3 max-w-[46ch] text-[0.75rem] leading-relaxed text-smoke">
                    {collection.description}
                  </span>
                </Link>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
