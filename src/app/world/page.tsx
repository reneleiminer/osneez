import type { Metadata } from "next";
import Link from "next/link";

import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import { visualSeed } from "@/lib/shop/product";
import { getWorldStories } from "@/lib/shop/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "World",
  description:
    "Night runs, Bike Meets, Editorials und alles hinter den Drops. OSNEEZ World.",
  alternates: { canonical: "/world" },
};

export default async function WorldPage() {
  const stories = await getWorldStories();

  return (
    <>
      <section className="os-edge py-14 lg:py-20">
        <p className="os-eyebrow text-signal">OSNEEZ World</p>
        <h1 className="os-display mt-4 text-[clamp(3rem,13vw,10rem)] leading-[0.78]">
          The scene
          <br />
          behind it.
        </h1>
        <p className="mt-8 max-w-[52ch] text-sm leading-relaxed text-smoke">
          OSNEEZ ist nicht nur ein Shop. Hier landen Ride-Outs, Garage Nights,
          Shootings und alles, was zwischen zwei Drops passiert. Wenn du fährst,
          baust oder fotografierst — das hier ist der Weg rein.
        </p>
        <Link href="/contact" className="os-btn os-btn-ghost mt-10">
          Ride with us
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      <div className="os-display border-y os-rule bg-void py-3 text-[clamp(1.25rem,3.5vw,2.25rem)] text-bone/70">
        <Marquee
          items={["NIGHT RUNS", "BIKE MEETS", "EDITORIALS", "GARAGE NIGHTS"]}
        />
      </div>

      <div className="os-edge py-14 lg:py-20">
        <ul className="grid gap-4 md:grid-cols-2">
          {stories.map((story, index) => {
            const hash = visualSeed(story.slug);
            return (
              <li
                key={story.id}
                className={index === 0 ? "md:col-span-2" : ""}
              >
                <Reveal delay={(index % 3) * 90}>
                  <article
                    className="os-frame flex aspect-4/5 flex-col justify-end p-6 sm:aspect-16/9"
                    style={{
                      backgroundImage: `radial-gradient(80% 65% at ${18 + (hash % 60)}% ${25 + ((hash >> 5) % 50)}%, rgba(228,38,28,0.16) 0%, transparent 58%), linear-gradient(${125 + (hash % 70)}deg, #0c0e12 0%, #22262c 100%)`,
                    }}
                  >
                    <p className="os-label relative z-10 text-[0.5625rem] text-smoke">
                      {story.location} / {story.timestamp_label}
                    </p>
                    <h2 className="os-display relative z-10 mt-2 text-[clamp(2rem,6vw,4.5rem)] leading-[0.85]">
                      {story.title}
                    </h2>
                    <p className="relative z-10 mt-3 max-w-[52ch] text-[0.8125rem] leading-relaxed text-smoke">
                      {story.excerpt}
                    </p>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>

        <p className="mt-12 max-w-[60ch] text-[0.75rem] leading-relaxed text-smoke">
          Platzhalter-Inhalte. Die Struktur (Tabelle <code>world_stories</code> +
          Storage-Bucket <code>world</code>) steht bereits — sobald echte
          Shootings vorliegen, erscheinen sie hier automatisch.
        </p>
      </div>
    </>
  );
}
