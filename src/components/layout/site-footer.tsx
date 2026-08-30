import Link from "next/link";

import { Marquee } from "@/components/motion/marquee";
import { FOOTER_NAV, MARQUEE_WORDS, SITE } from "@/lib/site";
import { NewsletterSection } from "./newsletter-section";

const COLUMNS = [
  { title: "Shop", links: FOOTER_NAV.shop },
  { title: "Brand", links: FOOTER_NAV.brand },
  { title: "Legal", links: FOOTER_NAV.legal },
];

export function SiteFooter() {
  return (
    <>
      <NewsletterSection />

      <div className="os-display border-y os-rule bg-void py-4 text-[clamp(1.75rem,5vw,3.5rem)] text-bone/80">
        <Marquee items={MARQUEE_WORDS} speed="fast" />
      </div>

      <footer className="bg-void">
        <div className="os-edge grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="os-display text-3xl tracking-[-0.03em]">OSNEEZ®</p>
            <p className="mt-4 max-w-[26ch] text-xs leading-relaxed text-smoke">
              Independent streetwear shaped by motorcycles, nights and the
              streets. Made for the hours nobody talks about.
            </p>
            <div className="mt-6 flex gap-5">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="os-label os-underline text-[0.625rem] text-smoke"
              >
                Instagram
              </a>
              <a
                href={SITE.tiktok}
                target="_blank"
                rel="noreferrer noopener"
                className="os-label os-underline text-[0.625rem] text-smoke"
              >
                TikTok
              </a>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="os-eyebrow mb-5">{column.title}</p>
              <ul className="grid gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="os-underline text-xs text-bone/75 transition-colors hover:text-bone"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="os-edge flex flex-wrap items-center justify-between gap-4 border-t os-rule py-6">
          <p className="os-label text-[0.5625rem] text-smoke">
            © {new Date().getFullYear()} {SITE.legalName} — All rights reserved
          </p>
          <p className="os-label text-[0.5625rem] text-smoke">
            Built after dark
          </p>
        </div>
      </footer>
    </>
  );
}
