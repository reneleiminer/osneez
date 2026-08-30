import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Marquee } from "@/components/motion/marquee";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductVisual } from "@/components/ui/product-visual";
import { formatDropDate, isReleased } from "@/lib/format";
import { getDropBySlug, getDrops, getProducts } from "@/lib/shop/queries";

export const revalidate = 300;

export async function generateStaticParams() {
  const drops = await getDrops();
  return drops.map((drop) => ({ slug: drop.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const drop = await getDropBySlug(slug);
  if (!drop) return { title: "Drop nicht gefunden" };
  return {
    title: `${drop.name} — ${drop.tagline ?? "OSNEEZ"}`,
    description: drop.description ?? undefined,
    alternates: { canonical: `/drops/${drop.slug}` },
    openGraph: {
      title: `${drop.name} — OSNEEZ®`,
      description: drop.description ?? undefined,
      images: drop.hero_image ? [{ url: drop.hero_image }] : undefined,
    },
  };
}

export default async function DropPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const drop = await getDropBySlug(slug);
  if (!drop) notFound();

  const products = await getProducts({ dropSlug: drop.slug });
  const live = isReleased(drop.release_date);

  return (
    <>
      <section className="relative flex min-h-[70svh] flex-col justify-end overflow-hidden">
        <ProductVisual
          seed={`${drop.slug}-hero`}
          frame="lifestyle"
          src={drop.hero_image}
          alt={`${drop.name} campaign frame`}
          label={drop.name}
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-void via-void/50 to-transparent" />

        <div className="os-edge relative z-10 pt-24 pb-12">
          <p className="os-label flex items-center gap-2 text-[0.625rem] text-smoke">
            <span
              className={`h-1.5 w-1.5 ${live ? "bg-signal" : "bg-steel"}`}
              aria-hidden="true"
            />
            {live ? "Available now" : "Upcoming"} ·{" "}
            {formatDropDate(drop.release_date)}
          </p>
          <h1 className="os-display mt-5 text-[clamp(3.5rem,16vw,12rem)] leading-[0.78]">
            {drop.name}
          </h1>
          <p className="os-display mt-3 text-[clamp(1.25rem,4vw,2.5rem)] text-signal">
            {drop.tagline}
          </p>
          <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-smoke">
            {drop.description}
          </p>
        </div>
      </section>

      <div className="os-display border-y os-rule bg-void py-3 text-[clamp(1.25rem,3.5vw,2.25rem)] text-bone/70">
        <Marquee items={[drop.name, drop.tagline ?? "OSNEEZ", "LIMITED RUN"]} />
      </div>

      <div className="os-edge py-14 lg:py-20">
        <div className="flex items-end justify-between border-b os-rule pb-5">
          <h2 className="os-display text-3xl">The line-up</h2>
          <p className="os-label text-[0.625rem] text-smoke">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
        <ProductGrid products={products} className="mt-10" />
      </div>
    </>
  );
}
