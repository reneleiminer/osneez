"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { PRIMARY_NAV } from "@/lib/site";

import { MobileMenu } from "./mobile-menu";
import { SearchOverlay } from "./search-overlay";

export type SocialLink = { label: string; href: string };

export function SiteHeader({ socials }: { socials: SocialLink[] }) {
  const pathname = usePathname();
  const { count, open: openBag } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/" && !searchOpen) {
        const target = event.target as HTMLElement | null;
        if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-paper focus:px-4 focus:py-2 focus:text-void"
      >
        Zum Inhalt springen
      </a>

      <header
        data-scrolled={scrolled}
        className="group sticky top-0 z-50 border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-500 data-[scrolled=true]:border-bone/10 data-[scrolled=true]:bg-void/80 data-[scrolled=true]:backdrop-blur-lg"
      >
        <div className="os-edge flex items-center justify-between transition-[height] duration-500 h-[4.5rem] group-data-[scrolled=true]:h-14 lg:h-20 lg:group-data-[scrolled=true]:h-16">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Menü öffnen"
              className="os-label text-[0.625rem]"
            >
              Menu
            </button>
          </div>

          <Link
            href="/"
            aria-label="OSNEEZ Startseite"
            className="os-display absolute left-1/2 -translate-x-1/2 text-xl tracking-[-0.03em] lg:static lg:translate-x-0 lg:text-2xl"
          >
            OSNEEZ
          </Link>

          <nav aria-label="Hauptnavigation" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {PRIMARY_NAV.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-active={active}
                      className="os-label os-underline text-[0.6875rem] text-bone/80 transition-colors hover:text-bone data-[active=true]:text-bone"
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="os-label hidden text-[0.625rem] text-bone/80 transition-colors hover:text-bone lg:block"
            >
              Search
            </button>
            <button
              type="button"
              onClick={openBag}
              className="os-label text-[0.625rem] transition-colors hover:text-signal"
              aria-label={`Warenkorb öffnen, ${count} Artikel`}
            >
              Bag ({count})
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSearch={() => {
          setMenuOpen(false);
          setSearchOpen(true);
        }}
        socials={socials}
      />
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
