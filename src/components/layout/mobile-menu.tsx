"use client";

import Link from "next/link";
import { useEffect } from "react";

import { PRIMARY_NAV } from "@/lib/site";
import type { SocialLink } from "./site-header";

export function MobileMenu({
  open,
  onClose,
  onSearch,
  socials,
}: {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
  socials: SocialLink[];
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal={open}
      aria-label="Menü"
      className={`fixed inset-0 z-[75] bg-void transition-[clip-path,opacity] duration-[560ms] ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
        open
          ? "pointer-events-auto opacity-100 [clip-path:inset(0_0_0%_0)]"
          : "pointer-events-none opacity-0 [clip-path:inset(0_0_100%_0)]"
      }`}
    >
      <div className="os-edge flex h-full flex-col pt-6 pb-10">
        <div className="flex items-center justify-between">
          <span className="os-display text-xl tracking-tight">OSNEEZ</span>
          <button
            type="button"
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className="os-label text-smoke transition-colors hover:text-bone"
          >
            Close
          </button>
        </div>

        <nav className="mt-14 flex-1">
          <ul>
            {PRIMARY_NAV.map((item, index) => (
              <li key={item.href} className="overflow-hidden border-b os-rule">
                <Link
                  href={item.href}
                  onClick={onClose}
                  tabIndex={open ? 0 : -1}
                  style={{ transitionDelay: open ? `${120 + index * 60}ms` : "0ms" }}
                  className={`os-display block py-4 text-[clamp(2.5rem,13vw,4.5rem)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    open
                      ? "translate-y-0 opacity-100"
                      : "translate-y-full opacity-0"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={onSearch}
          tabIndex={open ? 0 : -1}
          className="os-label mt-8 mb-10 flex w-full items-center justify-between border os-rule px-4 py-4 text-[0.6875rem] text-smoke transition-colors hover:border-bone hover:text-bone"
        >
          Search OSNEEZ
          <span aria-hidden="true">→</span>
        </button>

        <Link
          href="/account"
          onClick={onClose}
          tabIndex={open ? 0 : -1}
          className="os-label mb-10 flex w-full items-center justify-between border os-rule px-4 py-4 text-[0.6875rem] text-smoke transition-colors hover:border-bone hover:text-bone"
        >
          Account
          <span aria-hidden="true">→</span>
        </Link>

        <div className="grid gap-3">
          <p className="os-eyebrow">Follow</p>
          <div className="flex gap-6">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                tabIndex={open ? 0 : -1}
                className="os-label os-underline text-xs"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
