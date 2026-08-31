"use client";

import Link from "next/link";
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
      <p className="mt-8 max-w-[46ch] text-sm leading-relaxed text-smoke">
        Da ist etwas schiefgelaufen. Versuch es erneut — bleibt es, schick uns
        die Kennung unten, damit sich der Fehler im Server-Log zuordnen lässt.
      </p>

      {error.digest ? (
        <p className="mt-6 border-l-2 border-signal pl-4 font-mono text-[0.6875rem] text-smoke">
          Fehlerkennung: {error.digest}
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="os-btn os-btn-primary">
          Erneut versuchen
        </button>
        <Link href="/" className="os-btn os-btn-ghost">
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
