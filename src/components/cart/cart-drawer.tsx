"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { ProductVisual } from "@/components/ui/product-visual";
import { formatPrice } from "@/lib/format";
import {
  getServerSnapshot,
  getSnapshot,
  setDestination,
  subscribe,
} from "@/lib/shop/destination";
import type { ResolvedRate } from "@/types/settings";
import { useCart } from "./cart-provider";

function countryName(code: string): string {
  try {
    return (
      new Intl.DisplayNames(["de"], { type: "region" }).of(code) ?? code
    );
  } catch {
    return code;
  }
}

export function CartDrawer() {
  const {
    lines,
    count,
    subtotal,
    isOpen,
    close,
    remove,
    setQuantity,
    qualifiesForFreeShipping,
    freeShippingThreshold,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const country = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [countries, setCountries] = useState<string[]>(["DE"]);
  const [rates, setRates] = useState<ResolvedRate[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) panelRef.current?.focus();
  }, [isOpen]);

  // Live shipping cost for the chosen destination and cart value.
  useEffect(() => {
    if (!isOpen || count === 0) return;
    const controller = new AbortController();
    fetch(
      `/api/shipping-rates?country=${encodeURIComponent(country)}&subtotal=${subtotal}`,
      { signal: controller.signal },
    )
      .then((response) => response.json() as Promise<{
        rates?: ResolvedRate[];
        countries?: string[];
      }>)
      .then((data) => {
        setRates(data.rates ?? []);
        if (data.countries?.length) setCountries(data.countries);
      })
      .catch(() => {
        /* aborted or offline — the checkout still resolves rates server-side */
      });
    return () => controller.abort();
  }, [isOpen, country, subtotal, count]);

  function chooseCountry(code: string) {
    setDestination(code);
  }

  function dismiss() {
    setError(null);
    close();
  }

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          items: lines.map((line) => ({
            slug: line.slug,
            size: line.size,
            quantity: line.quantity,
          })),
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout konnte nicht gestartet werden.");
      }
      window.location.assign(data.url);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Etwas ist schiefgelaufen.",
      );
      setLoading(false);
    }
  }

  const cheapest = rates[0] ?? null;
  // The zone's own threshold wins; the settings value is the fallback.
  const threshold = cheapest?.freeOver ?? freeShippingThreshold;
  const missing = Math.max(0, threshold - subtotal);
  const isFree = cheapest ? cheapest.free : qualifiesForFreeShipping;
  const progress = Math.min(100, threshold ? (subtotal / threshold) * 100 : 100);

  return (
    <div
      className={`fixed inset-0 z-[70] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Warenkorb schließen"
        onClick={dismiss}
        tabIndex={isOpen ? 0 : -1}
        className={`absolute inset-0 bg-void/80 backdrop-blur-[2px] transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal={isOpen}
        aria-label="Warenkorb"
        tabIndex={-1}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[27rem] flex-col bg-ink outline-none transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b os-rule px-6 py-5">
          <div>
            <p className="os-eyebrow">Your bag</p>
            <p className="os-display mt-1 text-2xl">
              {count > 0 ? `${count} item${count > 1 ? "s" : ""}` : "Empty"}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            tabIndex={isOpen ? 0 : -1}
            className="os-label text-smoke transition-colors hover:text-bone"
          >
            Close
          </button>
        </header>

        {count > 0 ? (
          <div className="border-b os-rule px-6 py-4">
            <p className="os-label text-[0.625rem] text-smoke">
              {isFree
                ? "Free shipping unlocked"
                : `${formatPrice(missing)} left for free shipping`}
            </p>
            <div className="mt-2 h-px w-full bg-steel/60">
              <div
                className="h-px bg-signal transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-6">
          {count === 0 ? (
            <div className="flex h-full flex-col items-start justify-center gap-6 py-16">
              <p className="max-w-[22ch] text-sm leading-relaxed text-smoke">
                Noch nichts drin. Drop 001 ist live — solange der Run reicht.
              </p>
              <Link href="/shop" onClick={dismiss} className="os-btn os-btn-primary">
                Shop Drop 001
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-bone/10">
              {lines.map((line) => (
                <li key={`${line.slug}-${line.size}`} className="flex gap-4 py-5">
                  <Link
                    href={`/shop/${line.slug}`}
                    onClick={dismiss}
                    tabIndex={isOpen ? 0 : -1}
                    className="block w-20 shrink-0"
                  >
                    <ProductVisual
                      seed={line.slug}
                      src={line.image}
                      label={line.name}
                      className="aspect-3/4"
                      sizes="80px"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link
                        href={`/shop/${line.slug}`}
                        onClick={dismiss}
                        tabIndex={isOpen ? 0 : -1}
                        className="os-label text-xs"
                      >
                        {line.name}
                      </Link>
                      <span className="text-xs tabular-nums">
                        {formatPrice(line.price * line.quantity)}
                      </span>
                    </div>
                    <p className="mt-1 text-[0.6875rem] tracking-wide text-smoke uppercase">
                      {line.size} · {line.color}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center border os-rule">
                        <button
                          type="button"
                          tabIndex={isOpen ? 0 : -1}
                          aria-label={`Menge verringern für ${line.name}`}
                          onClick={() =>
                            setQuantity(line.slug, line.size, line.quantity - 1)
                          }
                          className="px-3 py-1 text-sm text-smoke transition-colors hover:text-bone"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-xs tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          tabIndex={isOpen ? 0 : -1}
                          aria-label={`Menge erhöhen für ${line.name}`}
                          onClick={() =>
                            setQuantity(line.slug, line.size, line.quantity + 1)
                          }
                          className="px-3 py-1 text-sm text-smoke transition-colors hover:text-bone"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        tabIndex={isOpen ? 0 : -1}
                        onClick={() => remove(line.slug, line.size)}
                        className="os-label text-[0.625rem] text-smoke transition-colors hover:text-signal"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {count > 0 ? (
          <footer className="border-t os-rule px-6 py-5">
            {error ? (
              <p
                role="alert"
                className="mb-4 border-l-2 border-signal pl-3 text-xs leading-relaxed text-signal"
              >
                {error}
              </p>
            ) : null}

            <div className="mb-4">
              <label
                htmlFor="cart-country"
                className="os-label text-[0.625rem] text-smoke"
              >
                Lieferland
              </label>
              <select
                id="cart-country"
                value={country}
                onChange={(event) => chooseCountry(event.target.value)}
                tabIndex={isOpen ? 0 : -1}
                className="mt-2 w-full border os-rule bg-ink px-3 py-2 text-xs"
              >
                {countries.map((code) => (
                  <option key={code} value={code}>
                    {countryName(code)}
                  </option>
                ))}
              </select>
            </div>

            <div className="os-label flex items-baseline justify-between text-xs">
              <span className="text-smoke">Zwischensumme</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            {cheapest ? (
              <div className="os-label mt-2 flex items-baseline justify-between text-xs">
                <span className="text-smoke">
                  Versand · {cheapest.name}
                </span>
                <span className="tabular-nums">
                  {cheapest.amount === 0 ? "gratis" : formatPrice(cheapest.amount)}
                </span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={checkout}
              disabled={loading}
              tabIndex={isOpen ? 0 : -1}
              className="os-btn os-btn-signal mt-4 w-full"
            >
              {loading ? "Loading…" : "Checkout"}
            </button>
            <p className="mt-3 text-center text-[0.625rem] tracking-wide text-smoke uppercase">
              Steuern inklusive · Endpreis im Checkout
            </p>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
