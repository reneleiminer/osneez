"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-driven type sequence. A tall track holds a sticky stage; scroll
 * progress (0 → 1) drives two counter-moving wordmark rows and a three-line
 * statement that resolves at the end. Everything is transform/opacity only.
 */
export function CinematicScroll() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const statementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      statementRef.current?.style.setProperty("opacity", "1");
      return;
    }

    let frame = 0;
    let active = false;

    const observer = new IntersectionObserver((entries) => {
      active = entries[0]?.isIntersecting ?? false;
      if (active) schedule();
    });
    observer.observe(track);

    function update() {
      frame = 0;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const progress =
        distance <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / distance));

      if (leftRef.current) {
        leftRef.current.style.transform = `translate3d(${(-40 + progress * 80).toFixed(2)}%, 0, 0)`;
      }
      if (rightRef.current) {
        rightRef.current.style.transform = `translate3d(${(40 - progress * 80).toFixed(2)}%, 0, 0)`;
      }
      if (statementRef.current) {
        const reveal = Math.min(1, Math.max(0, (progress - 0.45) / 0.35));
        statementRef.current.style.opacity = reveal.toFixed(3);
        statementRef.current.style.transform = `translate3d(0, ${((1 - reveal) * 40).toFixed(2)}px, 0)`;
      }
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
  }, []);

  return (
    <section
      ref={trackRef}
      aria-label="OSNEEZ — built after dark"
      className="relative h-[240vh] bg-void"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60% 50% at 30% 40%, rgba(228,38,28,0.14) 0%, transparent 62%), linear-gradient(200deg, #0d0f13 0%, #08080a 60%, #16181d 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 5px)",
          }}
        />

        <div
          ref={leftRef}
          className="os-display relative w-max text-[clamp(5rem,18vw,16rem)] leading-[0.8] whitespace-nowrap text-bone/12 will-change-transform"
          aria-hidden="true"
        >
          OSNEEZ — OSNEEZ — OSNEEZ
        </div>

        <div
          ref={statementRef}
          className="os-edge relative z-10 py-10 opacity-0 will-change-transform"
        >
          <p className="os-display text-[clamp(3rem,12vw,9rem)] leading-[0.82]">
            Built
            <br />
            After
            <br />
            <span className="text-signal">Dark.</span>
          </p>
        </div>

        <div
          ref={rightRef}
          className="os-display relative ml-auto w-max text-[clamp(5rem,18vw,16rem)] leading-[0.8] whitespace-nowrap text-bone/12 will-change-transform"
          aria-hidden="true"
        >
          RIDE LOUD — NO IDLE — RIDE LOUD
        </div>
      </div>
    </section>
  );
}
