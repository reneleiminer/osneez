"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ProductVisual } from "@/components/ui/product-visual";
import { formatPrice } from "@/lib/format";
import { CATEGORIES } from "@/lib/site";
import type { SearchItem } from "@/types/shop";

const SUGGESTIONS = ["hoodie", "tee", "zipper", "cap"];

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [pending, setPending] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const focus = window.setTimeout(() => inputRef.current?.focus(), 120);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(focus);
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Debounced lookup against /api/search. State only changes from async
  // callbacks, never synchronously inside the effect body.
  useEffect(() => {
    const needle = term.trim();
    if (!needle) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setPending(true);
      fetch(`/api/search?q=${encodeURIComponent(needle)}`, {
        signal: controller.signal,
      })
        .then((response) => response.json() as Promise<{ items?: SearchItem[] }>)
        .then((data) => {
          setResults(data.items ?? []);
          setCursor(0);
          setPending(false);
        })
        .catch(() => {
          /* aborted or offline — keep the previous results */
        });
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  function search(value: string) {
    setTerm(value);
    setCursor(0);
    if (!value.trim()) {
      setResults([]);
      setPending(false);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((value) => (value + 1) % results.length);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((value) => (value - 1 + results.length) % results.length);
    }
    if (event.key === "Enter") {
      const target = results[cursor];
      if (!target) return;
      event.preventDefault();
      onClose();
      router.push(`/shop/${target.slug}`);
    }
  }

  const hasTerm = term.trim().length > 0;

  return (
    <div
      role="dialog"
      aria-modal={open}
      aria-label="Suche"
      onKeyDown={onKeyDown}
      className={`fixed inset-0 z-[80] bg-void/97 backdrop-blur-md transition-opacity duration-400 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="os-edge flex h-full flex-col pt-8 pb-12">
        <div className="flex items-center justify-between">
          <span className="os-eyebrow">Search</span>
          <button
            type="button"
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className="os-label text-smoke transition-colors hover:text-bone"
          >
            Close
          </button>
        </div>

        <div className="mt-10 border-b os-rule pb-4">
          <label htmlFor="os-search" className="sr-only">
            Produkte durchsuchen
          </label>
          <input
            id="os-search"
            ref={inputRef}
            value={term}
            onChange={(event) => search(event.target.value)}
            placeholder="Search OSNEEZ"
            autoComplete="off"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="os-search-results"
            aria-autocomplete="list"
            aria-activedescendant={
              results[cursor] ? `os-result-${results[cursor].slug}` : undefined
            }
            tabIndex={open ? 0 : -1}
            className="os-display w-full bg-transparent text-[clamp(2rem,8vw,5rem)] tracking-tight outline-none placeholder:text-steel"
          />
        </div>

        <div className="mt-8 flex-1 overflow-y-auto">
          {!hasTerm ? (
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <p className="os-eyebrow mb-4">Try</p>
                <ul className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <li key={suggestion}>
                      <button
                        type="button"
                        tabIndex={open ? 0 : -1}
                        onClick={() => search(suggestion)}
                        className="os-label border os-rule px-3 py-2 text-[0.625rem] text-smoke transition-colors hover:border-bone hover:text-bone"
                      >
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="os-eyebrow mb-4">Categories</p>
                <ul className="grid gap-1">
                  {CATEGORIES.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/shop?category=${category.slug}`}
                        onClick={onClose}
                        tabIndex={open ? 0 : -1}
                        className="os-display block py-1 text-3xl text-bone/70 transition-colors hover:text-bone"
                      >
                        {category.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : results.length === 0 ? (
            <p
              aria-live="polite"
              className="max-w-[40ch] text-sm leading-relaxed text-smoke"
            >
              {pending ? (
                "Suche läuft …"
              ) : (
                <>
                  Kein Treffer für „{term}“. Probier einen anderen Begriff oder
                  sieh dir den kompletten{" "}
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="os-underline text-bone"
                  >
                    Shop
                  </Link>{" "}
                  an.
                </>
              )}
            </p>
          ) : (
            <ul
              id="os-search-results"
              role="listbox"
              aria-label="Suchergebnisse"
              className="grid gap-px bg-bone/10"
            >
              {results.map((item, index) => (
                <li
                  key={item.slug}
                  id={`os-result-${item.slug}`}
                  role="option"
                  aria-selected={index === cursor}
                  className="bg-void"
                >
                  <Link
                    href={`/shop/${item.slug}`}
                    onClick={onClose}
                    tabIndex={open ? 0 : -1}
                    onMouseEnter={() => setCursor(index)}
                    data-active={index === cursor}
                    className="group flex items-center gap-5 px-2 py-4 transition-colors data-[active=true]:bg-asphalt"
                  >
                    <ProductVisual
                      seed={item.slug}
                      src={item.image}
                      label={item.name}
                      className="w-16 shrink-0 aspect-3/4"
                      sizes="64px"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="os-label truncate text-xs">{item.name}</p>
                      <p className="mt-1 truncate text-[0.6875rem] tracking-wide text-smoke uppercase">
                        {item.subtitle ?? item.category}
                      </p>
                    </div>
                    <span className="text-xs tabular-nums text-smoke">
                      {formatPrice(item.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
