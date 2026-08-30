import Link from "next/link";

export default function NotFound() {
  return (
    <div className="os-edge flex min-h-[70svh] flex-col justify-center py-20">
      <p className="os-eyebrow text-signal">404</p>
      <h1 className="os-display mt-4 text-[clamp(3.5rem,16vw,12rem)] leading-[0.78]">
        Wrong
        <br />
        turn.
      </h1>
      <p className="mt-8 max-w-[42ch] text-sm leading-relaxed text-smoke">
        Diese Seite gibt es nicht — oder nicht mehr. Drops verschwinden, Links
        auch.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/shop" className="os-btn os-btn-primary">
          Go to shop
          <span aria-hidden="true">→</span>
        </Link>
        <Link href="/" className="os-btn os-btn-ghost">
          Back home
        </Link>
      </div>
    </div>
  );
}
