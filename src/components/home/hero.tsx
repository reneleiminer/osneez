import Link from "next/link";

import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/motion/reveal";
import type { Settings } from "@/types/settings";
import type { Drop } from "@/types/shop";

/**
 * Full-bleed opening frame. The campaign film is set per drop (`hero_video` /
 * `hero_image`) or globally under Settings → Shop; until then the generated
 * cinematic backdrop below stands in.
 */
export function Hero({
  drop,
  settings,
}: {
  drop: Drop | null;
  settings: Settings;
}) {
  const video = drop?.hero_video ?? settings.hero_video_url;
  const poster = drop?.hero_image ?? settings.hero_image_url;

  return (
    <section className="relative flex min-h-[calc(100svh-6.75rem)] flex-col justify-end overflow-hidden bg-void">
      <div className="absolute inset-0">
        {video ? (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={poster ?? undefined}
          >
            <source src={video} />
          </video>
        ) : (
          <div className="os-hero-drift absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(70% 55% at 22% 18%, rgba(228,38,28,0.22) 0%, transparent 60%), radial-gradient(55% 45% at 82% 72%, rgba(140,150,165,0.18) 0%, transparent 62%), linear-gradient(168deg, #101216 0%, #08080a 55%, #14161b 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(96deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 140px)",
              }}
            />
            <div className="absolute top-1/3 left-0 h-[38%] w-full bg-linear-to-r from-transparent via-signal/15 to-transparent blur-3xl" />
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-void via-void/45 to-void/25" />

      <div className="os-edge relative z-10 flex flex-col gap-10 pt-28 pb-14 lg:pb-20">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 animate-pulse bg-signal" />
          <p className="os-eyebrow text-bone">
            {drop ? `${drop.name} — available now` : "Drop 001 — available now"}
          </p>
        </div>

        <h1 className="os-display text-[clamp(4.5rem,20vw,17rem)] leading-[0.76] tracking-[-0.04em]">
          <span className="block overflow-hidden">
            <Reveal as="span" variant="mask" className="block">
              OSNEEZ
            </Reveal>
          </span>
        </h1>

        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <TextReveal
              as="p"
              lines={["Built after dark.", "Made for the hours", "nobody talks about."]}
              baseDelay={220}
              stagger={90}
              className="os-display text-[clamp(1.5rem,3.4vw,2.75rem)] leading-[0.95] text-bone/90"
            />
          </div>

          <div className="flex flex-wrap gap-3 lg:col-span-6 lg:justify-end">
            <Link
              href={drop ? `/drops/${drop.slug}` : "/shop"}
              className="os-btn os-btn-primary"
            >
              Shop {drop?.name ?? "Drop 001"}
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/world" className="os-btn os-btn-ghost">
              Explore OSNEEZ
            </Link>
          </div>
        </div>
      </div>

      <div className="os-edge relative z-10 flex items-center justify-between border-t os-rule py-4">
        <p className="os-label text-[0.5625rem] text-smoke">
          Independent — small runs
        </p>
        <p className="os-label hidden text-[0.5625rem] text-smoke sm:block">
          No idle
        </p>
        <p className="os-label flex items-center gap-2 text-[0.5625rem] text-smoke">
          Scroll
          <span aria-hidden="true" className="inline-block animate-bounce">
            ↓
          </span>
        </p>
      </div>
    </section>
  );
}
