import type { ReactNode } from "react";

type MarqueeProps = {
  items: readonly string[];
  speed?: "normal" | "fast";
  className?: string;
  separator?: ReactNode;
};

/**
 * Pure CSS marquee — no JavaScript, no layout thrash. The track is duplicated
 * once and translated by -50% so the loop is seamless.
 */
export function Marquee({
  items,
  speed = "normal",
  className = "",
  separator = "/",
}: MarqueeProps) {
  const sequence = [...items, ...items];

  return (
    <div className={`os-marquee overflow-hidden ${className}`}>
      <div className="os-marquee-track" data-speed={speed} aria-hidden="true">
        {sequence.map((item, index) => (
          <span key={`${item}-${index}`} className="flex shrink-0 items-center">
            <span className="whitespace-nowrap">{item}</span>
            <span className="mx-[0.9em] text-signal">{separator}</span>
          </span>
        ))}
      </div>
      <span className="sr-only">{items.join(", ")}</span>
    </div>
  );
}
