import Image from "next/image";

import { visualSeed } from "@/lib/shop/product";
import type { ProductImageType } from "@/types/shop";

type ProductVisualProps = {
  /** Stable key — normally the product slug. */
  seed: string;
  label?: string;
  frame?: ProductImageType;
  src?: string | null;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

const FRAME_ORDER: ProductImageType[] = ["front", "back", "detail", "lifestyle"];

/**
 * Renders real product photography when it exists and a deterministic
 * generated frame when it does not. The placeholder is intentionally graphic
 * rather than a grey box so the storefront still reads as a finished brand
 * before the first shoot lands.
 *
 * Replace by adding rows to `product_images` (bucket: products).
 */
export function ProductVisual({
  seed,
  label,
  frame = "front",
  src,
  alt,
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: ProductVisualProps) {
  if (src) {
    return (
      <div className={`os-frame ${className}`}>
        <Image
          src={src}
          alt={alt ?? label ?? ""}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  const hash = visualSeed(`${seed}-${frame}`);
  const angle = 120 + (hash % 90);
  const glowX = 15 + (hash % 60);
  const glowY = 20 + ((hash >> 4) % 55);
  const tone = (hash >> 8) % 3;
  const base =
    tone === 0
      ? ["#101216", "#1c1f25"]
      : tone === 1
        ? ["#0b0c0f", "#22252b"]
        : ["#14161a", "#2b2f36"];
  const index = FRAME_ORDER.indexOf(frame) + 1;

  return (
    <div
      className={`os-frame ${className}`}
      role="img"
      aria-label={alt ?? `${label ?? seed} — placeholder ${frame} view`}
      style={{
        backgroundImage: `radial-gradient(120% 90% at ${glowX}% ${glowY}%, rgba(228,38,28,0.16) 0%, transparent 55%), linear-gradient(${angle}deg, ${base[0]} 0%, ${base[1]} 100%)`,
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <span className="os-label text-[0.5625rem] text-smoke">
            {String(index).padStart(2, "0")} / {frame}
          </span>
          <span className="os-label text-[0.5625rem] text-smoke">OSNEEZ®</span>
        </div>
        <div className="os-display text-[clamp(2.5rem,9vw,6rem)] leading-[0.78] text-bone/10">
          OS
          <br />
          NEEZ
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 w-[18%] bg-linear-to-r from-transparent via-bone/10 to-transparent"
        style={{ left: `${(hash >> 3) % 60}%` }}
      />
    </div>
  );
}
