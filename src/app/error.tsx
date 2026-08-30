"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[osneez] render error:", error);
  }, [error]);

  return (
    <div className="os-edge flex min-h-[70svh] flex-col justify-center py-20">
      <p className="os-eyebrow text-signal">Error</p>
      <h1 className="os-display mt-4 text-[clamp(3rem,12vw,9rem)] leading-[0.78]">
        Something
        <br />
        stalled.
      </h1>
      <p className="mt-8 max-w-[42ch] text-sm leading-relaxed text-smoke">
        Da ist etwas schiefgelaufen. Versuch es erneut — wenn es bleibt, schreib
        uns kurz.
      </p>
      <button type="button" onClick={reset} className="os-btn os-btn-primary mt-10 self-start">
        Try again
      </button>
    </div>
  );
}
