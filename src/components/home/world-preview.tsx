import Link from "next/link";

import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { visualSeed } from "@/lib/shop/product";
import type { WorldStory } from "@/types/shop";

export function WorldPreview({ stories }: { stories: WorldStory[] }) {
  if (!stories.length) return null;
  const [lead, ...rest] = stories;

  return (
    <section aria-labelledby="world-heading" className="border-t os-rule bg-ink">
      <div className="os-edge py-20 lg:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b os-rule pb-5">
          <div>
            <p className="os-eyebrow text-signal">05 / OSNEEZ World</p>
            <h2
              id="world-heading"
              className="os-display mt-3 text-[clamp(2.5rem,7vw,5.5rem)]"
            >
              Not a shop.
              <br />A scene.
            </h2>
          </div>
          <Link href="/world" className="os-label os-underline text-[0.6875rem]">
            Enter the world
          </Link>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal variant="mask">
              <Link href="/world" className="group block">
                <Parallax distance={-30}>
                  <StoryFrame story={lead} className="aspect-4/3" large />
                </Parallax>
              </Link>
            </Reveal>
          </div>

          <ul className="grid gap-8 lg:col-span-5 lg:content-between">
            {rest.map((story, index) => (
              <li key={story.id}>
                <Reveal delay={index * 110}>
                  <Link href="/world" className="group flex items-center gap-5">
                    <StoryFrame story={story} className="aspect-square w-28 shrink-0" />
                    <div>
                      <p className="os-label text-[0.625rem] text-smoke">
                        {story.location} / {story.timestamp_label}
                      </p>
                      <p className="os-display mt-1 text-2xl transition-colors group-hover:text-signal">
                        {story.title}
                      </p>
                      <p className="mt-2 max-w-[34ch] text-[0.6875rem] leading-relaxed text-smoke">
                        {story.excerpt}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function StoryFrame({
  story,
  className = "",
  large = false,
}: {
  story: WorldStory;
  className?: string;
  large?: boolean;
}) {
  const hash = visualSeed(story.slug);
  return (
    <div
      role="img"
      aria-label={`${story.title} — placeholder campaign frame`}
      className={`os-frame relative flex items-end overflow-hidden ${className}`}
      style={{
        backgroundImage: `radial-gradient(80% 60% at ${18 + (hash % 60)}% ${30 + ((hash >> 6) % 45)}%, rgba(228,38,28,0.18) 0%, transparent 58%), linear-gradient(${125 + (hash % 70)}deg, #0c0e12 0%, #22262c 100%)`,
      }}
    >
      {large ? (
        <div className="relative z-10 w-full p-6">
          <p className="os-label text-[0.625rem] text-smoke">
            {story.location} / {story.timestamp_label}
          </p>
          <p className="os-display mt-2 text-[clamp(2rem,5vw,4rem)]">
            {story.title}
          </p>
        </div>
      ) : null}
    </div>
  );
}
