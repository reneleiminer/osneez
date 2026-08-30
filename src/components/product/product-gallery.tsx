"use client";

import { useEffect, useState } from "react";

import { ProductVisual } from "@/components/ui/product-visual";
import type { Product, ProductImageType } from "@/types/shop";

const FALLBACK_FRAMES: ProductImageType[] = [
  "front",
  "back",
  "detail",
  "lifestyle",
];

type Frame = {
  key: string;
  src: string | null;
  alt: string;
  type: ProductImageType;
};

export function ProductGallery({ product }: { product: Product }) {
  const frames: Frame[] = product.images.length
    ? product.images.map((image) => ({
        key: image.id,
        src: image.image_url,
        alt: image.alt || `${product.name} — ${image.type}`,
        type: image.type,
      }))
    : FALLBACK_FRAMES.map((type) => ({
        key: `${product.slug}-${type}`,
        src: null,
        alt: `${product.name} — ${type} view`,
        type,
      }));

  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const active = frames[Math.min(index, frames.length - 1)];

  useEffect(() => {
    if (!zoom) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoom(false);
      if (event.key === "ArrowRight")
        setIndex((value) => (value + 1) % frames.length);
      if (event.key === "ArrowLeft")
        setIndex((value) => (value - 1 + frames.length) % frames.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [zoom, frames.length]);

  return (
    <div>
      {/* Mobile: edge-to-edge swipe rail */}
      <div className="-mx-[clamp(1.25rem,4vw,4.5rem)] flex snap-x snap-mandatory gap-px overflow-x-auto lg:hidden">
        {frames.map((frame) => (
          <ProductVisual
            key={frame.key}
            seed={product.slug}
            src={frame.src}
            alt={frame.alt}
            label={product.name}
            frame={frame.type}
            priority={frame.type === "front"}
            sizes="100vw"
            className="aspect-4/5 w-[88vw] shrink-0 snap-center"
          />
        ))}
      </div>

      {/* Desktop: stacked hero frame + thumbnails */}
      <div className="hidden gap-4 lg:flex">
        <ul className="flex w-20 shrink-0 flex-col gap-3">
          {frames.map((frame, position) => (
            <li key={frame.key}>
              <button
                type="button"
                onClick={() => setIndex(position)}
                aria-label={`Ansicht ${position + 1}: ${frame.type}`}
                data-active={position === index}
                className="block w-full opacity-45 transition-opacity duration-500 hover:opacity-100 data-[active=true]:opacity-100"
              >
                <ProductVisual
                  seed={product.slug}
                  src={frame.src}
                  alt=""
                  label={product.name}
                  frame={frame.type}
                  sizes="80px"
                  className="aspect-4/5 w-full"
                />
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label="Bild vergrößern"
          className="group relative min-w-0 flex-1 cursor-zoom-in"
        >
          <ProductVisual
            seed={product.slug}
            src={active.src}
            alt={active.alt}
            label={product.name}
            frame={active.type}
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="aspect-4/5 w-full"
          />
          <span className="os-label absolute right-4 bottom-4 bg-void/70 px-2 py-1 text-[0.5625rem] text-bone opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100">
            Zoom
          </span>
        </button>
      </div>

      {zoom ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} Galerie`}
          className="fixed inset-0 z-[85] flex flex-col bg-void/98 backdrop-blur-sm"
        >
          <div className="os-edge flex items-center justify-between py-5">
            <p className="os-label text-[0.625rem] text-smoke">
              {product.name} — {active.type}
            </p>
            <button
              type="button"
              onClick={() => setZoom(false)}
              className="os-label text-[0.625rem] text-smoke transition-colors hover:text-bone"
              autoFocus
            >
              Close
            </button>
          </div>
          <div className="os-edge flex flex-1 items-center justify-center pb-10">
            <ProductVisual
              seed={product.slug}
              src={active.src}
              alt={active.alt}
              label={product.name}
              frame={active.type}
              sizes="90vw"
              className="h-full max-h-[80svh] w-full max-w-4xl"
            />
          </div>
          <div className="os-edge flex justify-center gap-2 pb-8">
            {frames.map((frame, position) => (
              <button
                key={frame.key}
                type="button"
                onClick={() => setIndex(position)}
                aria-label={`Ansicht ${position + 1}`}
                data-active={position === index}
                className="h-1 w-10 bg-steel transition-colors data-[active=true]:bg-signal"
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
