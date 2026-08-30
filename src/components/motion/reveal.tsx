"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Stagger in milliseconds. */
  delay?: number;
  /** "mask" uses a clip-path wipe, "fade" a translate + fade. */
  variant?: "fade" | "mask";
  /** Replay every time the element enters the viewport. */
  repeat?: boolean;
};

/**
 * Lightweight scroll reveal built on IntersectionObserver. Only opacity,
 * transform and clip-path are animated so the compositor does the work.
 */
export function Reveal({
  children,
  as,
  className = "",
  delay = 0,
  variant = "fade",
  repeat = false,
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Reduced motion is handled entirely in CSS; without IntersectionObserver
    // we flip the attribute directly so content is never left hidden. Neither
    // path needs React state.
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      node.dataset.visible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (!repeat) observer.disconnect();
          } else if (repeat) {
            setVisible(false);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [repeat]);

  const base = variant === "mask" ? "os-reveal-mask" : "os-reveal";

  return (
    <Tag
      ref={ref}
      data-visible={visible ? "true" : "false"}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
      className={`${base} ${className}`}
    >
      {children}
    </Tag>
  );
}
