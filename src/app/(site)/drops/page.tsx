import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { formatDropDate, isReleased } from "@/lib/format";
import { getDrops, getProducts } from "@/lib/shop/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Drops",
  description:
    "Jeder OSNEEZ Drop ist ein kleiner Run. Was weg ist, ist weg — hier siehst du, was live ist und was kommt.",
  alternates: { canonical: "/drops" },
};

export default async function DropsPage() {
  const drops = await getDrops();
  const products = await getProducts();

  return (
    <div className="os-edge py-14 lg:py-20">
      <header className="border-b os-rule pb-8">
        <p className="os-eyebrow text-signal">Drops</p>
        <h1 className="os-display mt-4 text-[clamp(3rem,11vw,8rem)] leading-[0.8]">
          Release
          <br />
          schedule
        </h1>
        <p className="mt-6 max-w-[46ch] text-sm leading-relaxed text-smoke">
          Kein Dauer-Sortiment. OSNEEZ arbeitet in Drops — kleine Runs, feste
          Termine, kein Nachdrucken auf Zuruf.
        </p>
      </header>

      <ul className="mt-12 grid gap-px bg-bone/10">
        {drops.map((drop, index) => {
          const live = isReleased(drop.release_date);
          const count = products.filter(
            (product) => product.drop_id === drop.id,
          ).length;

          return (
            <li key={drop.id} className="bg-void">
              <Reveal delay={index * 90}>
                <Link
                  href={`/drops/${drop.slug}`}
                  className="group grid gap-6 py-10 md:grid-cols-12 md:items-center"
                >
                  <div className="md:col-span-3">
                    <p className="os-label flex items-center gap-2 text-[0.5625rem] text-smoke">
                      <span
                        className={`h-1.5 w-1.5 ${live ? "bg-signal" : "bg-steel"}`}
                        aria-hidden="true"
                      />
                      {live ? "Available now" : "Upcoming"}
                    </p>
                    <p className="mt-3 text-[0.6875rem] tracking-wide text-smoke uppercase">
                      {formatDropDate(drop.release_date)}
                    </p>
                  </div>

                  <div className="md:col-span-6">
                    <p className="os-display text-[clamp(2.5rem,8vw,5rem)] leading-[0.85] transition-colors duration-500 group-hover:text-signal">
                      {drop.name}
                    </p>
                    <p className="os-display mt-2 text-lg text-bone/70">
                      {drop.tagline}
                    </p>
                  </div>

                  <div className="md:col-span-3 md:text-right">
                    <p className="os-label text-[0.625rem] text-smoke">
                      {count} {count === 1 ? "piece" : "pieces"}
                    </p>
                    <p className="os-label mt-3 inline-flex items-center gap-2 text-[0.625rem]">
                      {live ? "Shop the drop" : "See the line-up"}
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-500 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </p>
                  </div>
                </Link>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
