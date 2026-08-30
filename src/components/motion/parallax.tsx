"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Pixels of travel across the full viewport pass. Negative moves up. */
  distance?: number;
  axis?: "y" | "x";
};

/**
 * rAF-throttled parallax. Writes a single transform, skips entirely when the
 * user prefers reduced motion or the element is off screen.
 */
export function Parallax({
  children,
  className = "",
  distance = 60,
  axis = "y",
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let active = false;

    const observer = new IntersectionObserver((entries) => {
      active = entries[0]?.isIntersecting ?? false;
      if (active) schedule();
    });
    observer.observe(node);

    function update() {
      frame = 0;
      if (!node || !active) return;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      // -1 (below the fold) → 1 (above the fold)
      const progress = (viewport / 2 - (rect.top + rect.height / 2)) / viewport;
      const offset = progress * distance;
      node.style.transform =
        axis === "y"
          ? `translate3d(0, ${offset.toFixed(2)}px, 0)`
          : `translate3d(${offset.toFixed(2)}px, 0, 0)`;
    }

    function schedule() {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [distance, axis]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
