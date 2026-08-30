import Link from "next/link";

import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { ProductVisual } from "@/components/ui/product-visual";
import { formatDropDate } from "@/lib/format";
import type { Drop, Product } from "@/types/shop";

export function DropFeature({
  drop,
  pieces,
}: {
  drop: Drop | null;
  pieces: Product[];
}) {
  if (!drop) return null;
  const [numberPrefix, numberSuffix] = drop.name.split(/\s+/);

  return (
    <section
      aria-labelledby="drop-heading"
      className="relative border-t os-rule bg-void"
    >
      <div className="os-edge py-20 lg:py-32">
        <div className="flex items-center justify-between border-b os-rule pb-5">
          <p className="os-eyebrow text-signal">01 / Current drop</p>
          <p className="os-eyebrow">{formatDropDate(drop.release_date)}</p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <h2 id="drop-heading" className="os-display leading-[0.74]">
              <span className="block overflow-hidden">
                <Reveal
                  as="span"
                  variant="mask"
                  className="block text-[clamp(3rem,9vw,6rem)]"
                >
                  {numberPrefix}
                </Reveal>
              </span>
              <span className="block overflow-hidden">
                <Reveal
                  as="span"
                  variant="mask"
                  delay={90}
                  className="block text-[clamp(6rem,20vw,14rem)] text-signal"
                >
                  {numberSuffix ?? ""}
                </Reveal>
              </span>
            </h2>

            <Reveal delay={160}>
              <p className="mt-8 max-w-[38ch] text-sm leading-relaxed text-smoke">
                {drop.description}
              </p>
              <p className="os-display mt-8 text-[clamp(1.25rem,2.6vw,2rem)]">
                {drop.tagline}
              </p>
              <Link
                href={`/drops/${drop.slug}`}
                className="os-btn os-btn-signal mt-10"
              >
                Shop the drop
                <span aria-hidden="true">→</span>
              </Link>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Parallax distance={-40}>
              <Reveal variant="mask">
                <ProductVisual
                  seed={`${drop.slug}-campaign`}
                  frame="lifestyle"
                  src={drop.hero_image}
                  alt={`${drop.name} campaign frame`}
                  label={drop.name}
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="aspect-4/5 w-full sm:aspect-16/10 lg:aspect-4/5"
                />
              </Reveal>
            </Parallax>

            {pieces.length ? (
              <ul className="mt-6 grid grid-cols-3 gap-3">
                {pieces.slice(0, 3).map((piece, index) => (
                  <li key={piece.id}>
                    <Reveal delay={index * 90}>
                      <Link href={`/shop/${piece.slug}`} className="group block">
                        <ProductVisual
                          seed={piece.slug}
                          frame="detail"
                          label={piece.name}
                          sizes="18vw"
                          className="aspect-square w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                        />
                        <p className="os-label mt-2 truncate text-[0.5625rem] text-smoke">
                          {piece.name}
                        </p>
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
