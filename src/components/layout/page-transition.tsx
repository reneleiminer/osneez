"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Short black panel wipe between routes. Runs once per pathname change and
 * removes itself as soon as the keyframes finish so nothing stays mounted
 * over the page.
 */
export function PageTransition() {
  const pathname = usePathname();
  const [playing, setPlaying] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setPlaying(true);
    const timer = window.setTimeout(() => setPlaying(false), 760);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="os-wipe" data-playing={playing ? "true" : "false"} aria-hidden="true">
      <span className="os-display text-[clamp(2rem,8vw,5rem)] text-bone/25">
        OSNEEZ
      </span>
    </div>
  );
}
