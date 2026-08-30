import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "OSNEEZ ist unabhängige Streetwear zwischen Motorrad-Kultur, Nächten und Asphalt.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    index: "01",
    title: "Small runs",
    body: "Wir produzieren in Stückzahlen, die ausverkaufen können. Kein Lagerbestand, der zwei Jahre alt wird, kein Rabatt-Karussell.",
  },
  {
    index: "02",
    title: "Heavy over cheap",
    body: "480 gsm statt 280. Garment Dye statt Standardfarbe. Lieber ein Piece weniger im Drop und dafür eines, das bleibt.",
  },
  {
    index: "03",
    title: "Built with riders",
    body: "Jedes Teil wird auf der Straße getestet, nicht auf einer Puppe. Kragenhöhe, Ärmellänge und Reflektoren kommen aus echten Nachtfahrten.",
  },
  {
    index: "04",
    title: "No idle",
    body: "Zwischen den Drops passiert genauso viel wie an Release-Tagen. Meets, Shootings, Samples — sichtbar in OSNEEZ World.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="os-edge py-14 lg:py-20">
        <p className="os-eyebrow text-signal">About</p>
        <TextReveal
          as="h1"
          lines={["Made for", "the hours", "nobody talks", "about."]}
          className="os-display mt-4 text-[clamp(2.75rem,11vw,8.5rem)] leading-[0.8]"
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <p className="text-sm leading-relaxed text-smoke lg:col-span-5">
            OSNEEZ ist zwischen Tankstellenlicht, leeren Tunneln und viel zu
            spätem Heimfahren entstanden. Die Marke kommt aus der Motorrad- und
            Car-Culture, aber sie ist keine Biker-Uniform: Es ist Streetwear für
            Leute, deren beste Stunden nach Mitternacht liegen.
          </p>
          <p className="text-sm leading-relaxed text-smoke lg:col-span-5 lg:col-start-7">
            Wir arbeiten in Drops statt Saisons, produzieren in kleinen Runs und
            entwickeln jedes Piece so lange weiter, bis es die Nacht übersteht.
            Was ausverkauft ist, kommt nur zurück, wenn es besser geworden ist.
          </p>
        </div>
      </section>

      <section className="border-t os-rule">
        <div className="os-edge py-16 lg:py-24">
          <ul className="grid gap-px bg-bone/10">
            {PRINCIPLES.map((principle, index) => (
              <li key={principle.index} className="bg-void py-8">
                <Reveal delay={index * 80}>
                  <div className="grid gap-4 md:grid-cols-12 md:items-baseline">
                    <p className="os-eyebrow text-signal md:col-span-2">
                      {principle.index}
                    </p>
                    <h2 className="os-display text-[clamp(1.75rem,5vw,3rem)] md:col-span-4">
                      {principle.title}
                    </h2>
                    <p className="max-w-[52ch] text-[0.8125rem] leading-relaxed text-smoke md:col-span-6">
                      {principle.body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t os-rule bg-ink">
        <div className="os-edge flex flex-col items-start gap-6 py-16 lg:py-24">
          <p className="os-display text-[clamp(2rem,7vw,5rem)] leading-[0.85]">
            Ride loud.
            <br />
            <span className="text-signal">Move different.</span>
          </p>
          <Link href="/shop" className="os-btn os-btn-primary">
            Shop the drop
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
