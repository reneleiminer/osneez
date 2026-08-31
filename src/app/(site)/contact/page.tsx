import type { Metadata } from "next";
import Link from "next/link";

import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Fragen zu Bestellungen, Retouren, Kooperationen oder Presse — so erreichst du OSNEEZ.",
  alternates: { canonical: "/contact" },
};

const CHANNELS = [
  {
    title: "Orders & support",
    line: "Bestellungen, Größen, Retouren, Lieferstatus.",
    value: "[support@osneez.com]",
  },
  {
    title: "Collabs & press",
    line: "Kooperationen, Shootings, Presseanfragen.",
    value: "[press@osneez.com]",
  },
  {
    title: "Riders",
    line: "Du fährst, baust oder shootest? Meld dich.",
    value: "[riders@osneez.com]",
  },
];

export default function ContactPage() {
  return (
    <div className="os-edge py-14 lg:py-20">
      <header className="border-b os-rule pb-8">
        <p className="os-eyebrow text-signal">Contact</p>
        <h1 className="os-display mt-4 text-[clamp(3rem,11vw,8rem)] leading-[0.8]">
          Talk to us
        </h1>
        <p className="mt-6 max-w-[46ch] text-sm leading-relaxed text-smoke">
          Wir antworten in der Regel innerhalb von 24 Stunden an Werktagen. Für
          Bestellungen bitte immer die Bestellnummer mitschicken.
        </p>
      </header>

      <div className="mt-8 border-l-2 border-signal bg-asphalt/60 px-5 py-4">
        <p className="os-label text-[0.5625rem] text-signal">Platzhalter</p>
        <p className="mt-2 max-w-[68ch] text-[0.75rem] leading-relaxed text-smoke">
          Die unten stehenden Adressen sind Platzhalter. Vor dem Launch durch die
          echten Postfächer ersetzen — hier und in{" "}
          <code className="text-bone">src/lib/site.ts</code>.
        </p>
      </div>

      <ul className="mt-12 grid gap-px bg-bone/10">
        {CHANNELS.map((channel) => (
          <li key={channel.title} className="bg-void py-8">
            <div className="grid gap-3 md:grid-cols-12 md:items-baseline">
              <p className="os-label text-[0.625rem] text-smoke md:col-span-3">
                {channel.title}
              </p>
              <p className="os-display text-[clamp(1.5rem,4vw,2.5rem)] md:col-span-6">
                {channel.value}
              </p>
              <p className="text-[0.75rem] leading-relaxed text-smoke md:col-span-3">
                {channel.line}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-16 grid gap-6 border-t os-rule pt-10 sm:grid-cols-2">
        <div>
          <p className="os-eyebrow mb-3">Social</p>
          <div className="flex gap-6">
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="os-underline text-sm"
            >
              Instagram
            </a>
            <a
              href={SITE.tiktok}
              target="_blank"
              rel="noreferrer noopener"
              className="os-underline text-sm"
            >
              TikTok
            </a>
          </div>
        </div>
        <div>
          <p className="os-eyebrow mb-3">Legal</p>
          <div className="flex flex-wrap gap-6">
            <Link href="/imprint" className="os-underline text-sm">
              Impressum
            </Link>
            <Link href="/privacy" className="os-underline text-sm">
              Datenschutz
            </Link>
            <Link href="/returns" className="os-underline text-sm">
              Widerruf
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
