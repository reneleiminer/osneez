import { CategoryTiles } from "@/components/home/category-tiles";
import { CinematicScroll } from "@/components/home/cinematic-scroll";
import { DropFeature } from "@/components/home/drop-feature";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { WorldPreview } from "@/components/home/world-preview";
import { Marquee } from "@/components/motion/marquee";
import {
  getCurrentDrop,
  getProducts,
  getWorldStories,
} from "@/lib/shop/queries";
import { MARQUEE_WORDS } from "@/lib/site";
import { getSettings } from "@/lib/settings";

export const revalidate = 300;

export default async function HomePage() {
  const [drop, settings] = await Promise.all([getCurrentDrop(), getSettings()]);
  const [featured, dropPieces, stories] = await Promise.all([
    getProducts({ featured: true, limit: 4 }),
    drop ? getProducts({ dropSlug: drop.slug, limit: 3 }) : Promise.resolve([]),
    getWorldStories(),
  ]);

  return (
    <>
      <Hero drop={drop} settings={settings} />

      <div className="os-display border-y os-rule bg-void py-3 text-[clamp(1.25rem,3.5vw,2.25rem)] text-bone/70">
        <Marquee items={MARQUEE_WORDS} />
      </div>

      <DropFeature drop={drop} pieces={dropPieces} />
      <FeaturedProducts products={featured} />
      <CategoryTiles />
      <CinematicScroll />
      <WorldPreview stories={stories.slice(0, 3)} />
    </>
  );
}
