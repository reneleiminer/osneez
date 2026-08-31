import type { Metadata } from "next";
import Link from "next/link";

import { formatAddress, getSettings, isCompanyComplete } from "@/lib/settings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Fragen zu Bestellungen, Retouren, Kooperationen oder Presse — so erreichst du OSNEEZ.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSettings();

  const channels = [
    {
      title: "Orders & support",
      line: "Bestellungen, Größen, Retouren, Lieferstatus.",
      value: settings.support_email ?? settings.contact_email,
    },
    {
      title: "Collabs & press",
      line: "Kooperationen, Shootings, Presseanfragen.",
      value: settings.press_email ?? settings.contact_email,
    },
  ].filter((channel): channel is { title: string; line: string; value: string } =>
    Boolean(channel.value),
  );

  const socials = [
    { label: "Instagram", href: settings.instagram_url },
    { label: "TikTok", href: settings.tiktok_url },
  ].filter((entry): entry is { label: string; href: string } =>
    Boolean(entry.href),
  );

  const address = formatAddress(settings);

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

      {!isCompanyComplete(settings) ? (
        <div className="mt-8 border-l-2 border-signal bg-asphalt/60 px-5 py-4">
          <p className="os-label text-[0.5625rem] text-signal">
            Kontaktdaten fehlen
          </p>
          <p className="mt-2 max-w-[68ch] text-[0.75rem] leading-relaxed text-smoke">
            Die Firmen- und Kontaktdaten sind noch nicht vollständig hinterlegt.
            Sie werden unter Admin → Settings → Unternehmen gepflegt und
            erscheinen dann automatisch hier, im Impressum und im Footer.
          </p>
        </div>
      ) : null}

      {channels.length ? (
        <ul className="mt-12 grid gap-px bg-bone/10">
          {channels.map((channel) => (
            <li key={channel.title} className="bg-void py-8">
              <div className="grid gap-3 md:grid-cols-12 md:items-baseline">
                <p className="os-label text-[0.625rem] text-smoke md:col-span-3">
                  {channel.title}
                </p>
                <p className="os-display text-[clamp(1.25rem,3.5vw,2.25rem)] break-all md:col-span-6">
                  <a href={`mailto:${channel.value}`} className="os-underline">
                    {channel.value}
                  </a>
                </p>
                <p className="text-[0.75rem] leading-relaxed text-smoke md:col-span-3">
                  {channel.line}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-16 grid gap-10 border-t os-rule pt-10 sm:grid-cols-3">
        {address.length ? (
          <div>
            <p className="os-eyebrow mb-3">Anschrift</p>
            <address className="text-sm leading-relaxed text-smoke not-italic">
              {address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            {settings.phone ? (
              <p className="mt-3 text-sm text-smoke">{settings.phone}</p>
            ) : null}
          </div>
        ) : null}

        {socials.length ? (
          <div>
            <p className="os-eyebrow mb-3">Social</p>
            <div className="flex flex-wrap gap-6">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="os-underline text-sm"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}

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
