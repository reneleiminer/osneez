import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { CATEGORIES } from "@/lib/site";
import { visualSeed } from "@/lib/shop/product";

const EXTRA = [
  {
    slug: "riders",
    label: "Riders",
    line: "Community, meets, night runs.",
    href: "/world",
    soon: true,
  },
  {
    slug: "motor-division",
    label: "Motor Division",
    line: "Technical layers. Drop 002.",
    href: "/collections/motor-division",
    soon: true,
  },
];

export function CategoryTiles() {
  const tiles = [
    ...CATEGORIES.map((category) => ({
      slug: category.slug,
      label: category.label,
      line: category.line,
      href: `/shop?category=${category.slug}`,
      soon: false,
    })),
    ...EXTRA,
  ];

  return (
    <section
      aria-labelledby="categories-heading"
      className="border-t os-rule bg-void"
    >
      <div className="os-edge py-20 lg:py-28">
        <div className="flex items-end justify-between border-b os-rule pb-5">
          <h2 id="categories-heading" className="os-eyebrow text-signal">
            03 / Categories
          </h2>
          <p className="os-eyebrow">Pick your layer</p>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile, index) => {
            const hash = visualSeed(tile.slug);
            return (
              <li
                key={tile.slug}
                className={index === 0 ? "sm:col-span-2 lg:col-span-2" : ""}
              >
                <Reveal delay={(index % 4) * 80}>
                  <Link
                    href={tile.href}
                    className="group os-frame relative flex aspect-4/5 flex-col justify-end p-5 sm:aspect-4/3"
                    style={{
                      backgroundImage: `radial-gradient(90% 70% at ${20 + (hash % 55)}% ${25 + ((hash >> 5) % 50)}%, rgba(228,38,28,0.14) 0%, transparent 58%), linear-gradient(${140 + (hash % 60)}deg, #101216 0%, #1d2026 100%)`,
                    }}
                  >
                    <span className="absolute inset-0 bg-void/0 transition-colors duration-700 group-hover:bg-void/25" />
                    <span className="os-display relative z-10 text-[clamp(2rem,5vw,3.5rem)] leading-[0.85] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
                      {tile.label}
                    </span>
                    <span className="relative z-10 mt-2 flex items-center justify-between gap-3">
                      <span className="text-[0.6875rem] text-smoke">
                        {tile.line}
                      </span>
                      <span
                        aria-hidden="true"
                        className="translate-x-0 text-sm text-smoke transition-transform duration-500 group-hover:translate-x-1 group-hover:text-signal"
                      >
                        →
                      </span>
                    </span>
                    {tile.soon ? (
                      <span className="os-label absolute top-4 right-4 z-10 border os-rule px-2 py-1 text-[0.5rem] text-smoke">
                        Soon
                      </span>
                    ) : null}
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
