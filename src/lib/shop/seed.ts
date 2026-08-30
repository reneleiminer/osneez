import type {
  CategorySlug,
  Collection,
  Drop,
  Product,
  ProductBadge,
  ProductStatus,
  ProductVariant,
  WorldStory,
} from "@/types/shop";

/**
 * ---------------------------------------------------------------------------
 * SEED / DEMO CONTENT
 * ---------------------------------------------------------------------------
 * Everything in this file is placeholder content used until Supabase holds the
 * real catalogue. The shape matches the database schema 1:1 (see
 * supabase/migrations), so switching over is a data change, not a code change.
 * No product photography exists yet — image arrays are empty on purpose and the
 * UI renders generated placeholder frames instead.
 */

const NOW = "2026-01-01T00:00:00.000Z";

export const SEED_COLLECTIONS: Collection[] = [
  {
    id: "col-afterdark",
    slug: "afterdark",
    name: "AFTERDARK",
    description:
      "The core line. Heavy cotton, washed blacks, cuts that survive a night on the bike.",
    cover_image: null,
    active: true,
    sort_order: 1,
  },
  {
    id: "col-motor-division",
    slug: "motor-division",
    name: "MOTOR DIVISION",
    description:
      "Racing-derived graphics and technical detailing. Built with riders, tested on the road.",
    cover_image: null,
    active: true,
    sort_order: 2,
  },
  {
    id: "col-essentials",
    slug: "essentials",
    name: "ESSENTIALS",
    description:
      "Quiet pieces. Blank canvas, heavyweight base layers, everyday hardware.",
    cover_image: null,
    active: true,
    sort_order: 3,
  },
];

export const SEED_DROPS: Drop[] = [
  {
    id: "drop-001",
    slug: "drop-001",
    name: "DROP 001",
    tagline: "BUILT AFTER DARK.",
    description:
      "Ten pieces made for the hours nobody talks about. Cut heavy, washed down, produced in a run small enough to sell out.",
    release_date: "2026-02-14T19:00:00.000Z",
    hero_image: null,
    hero_video: null,
    active: true,
  },
  {
    id: "drop-002",
    slug: "drop-002",
    name: "DROP 002",
    tagline: "MOTOR DIVISION.",
    description:
      "Technical layers, riding-first patterning and the first OSNEEZ pieces designed on a bike instead of a mannequin.",
    release_date: "2026-09-26T19:00:00.000Z",
    hero_image: null,
    hero_video: null,
    active: true,
  },
];

type SeedInput = {
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  compare_at_price?: number;
  category: CategorySlug;
  collection_id: string;
  drop_id: string;
  color: string;
  sizes: string[];
  badge?: ProductBadge;
  status?: ProductStatus;
  featured?: boolean;
  stock?: number;
  soldOutSizes?: string[];
  description: string;
  material: string;
  fit: string;
  details: string;
};

const APPAREL = ["XS", "S", "M", "L", "XL", "XXL"];
const BOTTOMS = ["S", "M", "L", "XL"];
const ONE_SIZE = ["ONE SIZE"];

const SEED_INPUT: SeedInput[] = [
  {
    slug: "afterdark-tee",
    name: "Afterdark Tee",
    subtitle: "Washed Black",
    price: 5500,
    category: "tees",
    collection_id: "col-afterdark",
    drop_id: "drop-001",
    color: "Washed Black",
    sizes: APPAREL,
    badge: "NEW",
    featured: true,
    description:
      "The piece the whole drop is built around. Garment-dyed heavyweight jersey with a boxy body, dropped shoulder and a print that only reads properly under streetlight.",
    material: "100% organic cotton, 240 gsm, garment dyed.",
    fit: "Boxy, true to size. Take one down for a clean fit.",
    details: "Ribbed collar, double-stitched hem, screen print front and back.",
  },
  {
    slug: "velocity-tee",
    name: "Velocity Tee",
    subtitle: "Bone",
    price: 5500,
    category: "tees",
    collection_id: "col-motor-division",
    drop_id: "drop-001",
    color: "Bone",
    sizes: APPAREL,
    featured: true,
    description:
      "Motion-blur graphic pulled from a night run through the city. Off-white body, oversized back print, small chest hit.",
    material: "100% cotton, 220 gsm.",
    fit: "Relaxed, slightly longer body.",
    details: "Water-based print, no plastisol. Softens with every wash.",
  },
  {
    slug: "night-shift-longsleeve",
    name: "Night Shift Longsleeve",
    subtitle: "Asphalt",
    price: 7500,
    category: "tees",
    collection_id: "col-afterdark",
    drop_id: "drop-001",
    color: "Asphalt",
    sizes: APPAREL,
    description:
      "Long sleeve base layer with typography running from cuff to shoulder. Works under a jacket, works alone.",
    material: "100% cotton, 210 gsm.",
    fit: "Regular with an extended sleeve length.",
    details: "Ribbed cuffs, side-seam construction, tonal neck label.",
  },
  {
    slug: "pit-hoodie",
    name: "Pit Hoodie",
    subtitle: "Deep Black",
    price: 13000,
    category: "hoodies",
    collection_id: "col-afterdark",
    drop_id: "drop-001",
    color: "Deep Black",
    sizes: APPAREL,
    featured: true,
    badge: "LIMITED",
    stock: 6,
    soldOutSizes: ["XS", "XXL"],
    description:
      "480 gsm brushed-back fleece, cut heavy enough to stand on its own. Designed for standing around a workshop at 2am.",
    material: "80% cotton / 20% recycled polyester, 480 gsm brushed back.",
    fit: "Oversized. Take your normal size for volume, one down for regular.",
    details: "Double-layer hood, kangaroo pocket, embroidered wordmark.",
  },
  {
    slug: "racing-division-hoodie",
    name: "Racing Division Hoodie",
    subtitle: "Graphite / Signal",
    price: 14000,
    compare_at_price: 15500,
    category: "hoodies",
    collection_id: "col-motor-division",
    drop_id: "drop-001",
    color: "Graphite",
    sizes: APPAREL,
    badge: "LIMITED",
    stock: 4,
    description:
      "Full racing back panel, sponsor-style typography and one single hit of signal red. The loudest piece in the drop.",
    material: "80% cotton / 20% polyester, 450 gsm.",
    fit: "Relaxed, true to size.",
    details: "Puff print back panel, embroidered sleeve number, tonal drawcords.",
  },
  {
    slug: "midnight-zipper",
    name: "Midnight Zipper",
    subtitle: "Deep Black",
    price: 14500,
    category: "zipper",
    collection_id: "col-afterdark",
    drop_id: "drop-001",
    color: "Deep Black",
    sizes: APPAREL,
    featured: true,
    description:
      "Full-zip layer with a collar that actually covers your neck at speed. Reflective tape across the back yoke.",
    material: "82% cotton / 18% polyester, 460 gsm.",
    fit: "Regular with a longer body and sleeve.",
    details: "Metal zip, high funnel collar, reflective back detail, zip pockets.",
  },
  {
    slug: "heavyweight-jogger",
    name: "Heavyweight Jogger",
    subtitle: "Deep Black",
    price: 11000,
    category: "bottoms",
    collection_id: "col-essentials",
    drop_id: "drop-001",
    color: "Deep Black",
    sizes: BOTTOMS,
    description:
      "Matching 480 gsm bottom to the Pit Hoodie. Tapered leg, deep pockets, no branding louder than a heat-transfer tag.",
    material: "80% cotton / 20% recycled polyester, 480 gsm.",
    fit: "Regular with a tapered leg. Elastic waist and drawcord.",
    details: "Two side pockets, one zipped back pocket, ribbed cuff.",
  },
  {
    slug: "garage-cap",
    name: "Garage Cap",
    subtitle: "Bone",
    price: 4500,
    category: "accessories",
    collection_id: "col-essentials",
    drop_id: "drop-001",
    color: "Bone",
    sizes: ONE_SIZE,
    description:
      "Unstructured six-panel with a low crown and a curved brim broken in from the start.",
    material: "100% washed cotton twill.",
    fit: "One size, adjustable metal clasp.",
    details: "Embroidered front wordmark, tonal eyelets, cotton sweatband.",
  },
  {
    slug: "apex-balaclava",
    name: "Apex Balaclava",
    subtitle: "Deep Black",
    price: 3500,
    category: "accessories",
    collection_id: "col-motor-division",
    drop_id: "drop-001",
    color: "Deep Black",
    sizes: ONE_SIZE,
    status: "sold_out",
    badge: "SOLD OUT",
    stock: 0,
    description:
      "Thin merino-blend balaclava that fits under a helmet without bunching. First run gone in a weekend.",
    material: "70% merino wool / 30% nylon.",
    fit: "One size, close fitting.",
    details: "Flatlock seams, no front branding.",
  },
  {
    slug: "motor-division-jacket",
    name: "Motor Division Jacket",
    subtitle: "Asphalt — Drop 002",
    price: 24500,
    category: "zipper",
    collection_id: "col-motor-division",
    drop_id: "drop-002",
    color: "Asphalt",
    sizes: APPAREL,
    status: "coming_soon",
    badge: "UPCOMING",
    stock: 0,
    description:
      "The first OSNEEZ riding-adjacent outer layer. Waxed shell, articulated sleeves, storm cuffs. Releasing with Drop 002.",
    material: "Waxed cotton shell, quilted lining. Final spec in progress.",
    fit: "Regular over a hoodie.",
    details: "Sample stage. Join the inner circle for the release window.",
  },
];

function buildVariants(input: SeedInput): ProductVariant[] {
  const stock = input.stock ?? 24;
  return input.sizes.map((size, index) => ({
    id: `${input.slug}-${size.toLowerCase().replace(/\s+/g, "-")}`,
    product_id: input.slug,
    sku: `OSN-${input.slug.toUpperCase().slice(0, 6)}-${size.replace(/\s+/g, "")}`,
    size,
    color: input.color,
    stock: input.soldOutSizes?.includes(size) ? 0 : Math.max(0, stock - index),
    active: input.status !== "archived",
  }));
}

export const SEED_PRODUCTS: Product[] = SEED_INPUT.map((input) => ({
  id: input.slug,
  slug: input.slug,
  name: input.name,
  subtitle: input.subtitle,
  price: input.price,
  compare_at_price: input.compare_at_price ?? null,
  description: input.description,
  material: input.material,
  fit: input.fit,
  details: input.details,
  active: true,
  featured: input.featured ?? false,
  status: input.status ?? "active",
  category: input.category,
  collection_id: input.collection_id,
  drop_id: input.drop_id,
  badge: input.badge ?? null,
  created_at: NOW,
  updated_at: NOW,
  images: [],
  variants: buildVariants(input),
}));

export const SEED_WORLD: WorldStory[] = [
  {
    id: "world-night-run-001",
    slug: "night-run-001",
    title: "NIGHT RUN 001",
    location: "BERLIN",
    timestamp_label: "02:14 AM",
    excerpt:
      "Twenty-two bikes, one tunnel, no plan. The first OSNEEZ ride out and the shoot that became Drop 001.",
    cover_image: null,
    published_at: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "world-behind-the-drop",
    slug: "behind-the-drop",
    title: "BEHIND THE DROP",
    location: "WORKSHOP",
    timestamp_label: "DROP 001",
    excerpt:
      "Fabric weights, four sampling rounds and the reason the Pit Hoodie ended up at 480 gsm.",
    cover_image: null,
    published_at: "2026-02-08T00:00:00.000Z",
  },
  {
    id: "world-ride-with-us",
    slug: "ride-with-us",
    title: "RIDE WITH US",
    location: "OPEN CALL",
    timestamp_label: "ONGOING",
    excerpt:
      "Meets, garage nights and city runs. If you ride, build or shoot — this is the way in.",
    cover_image: null,
    published_at: "2026-03-02T00:00:00.000Z",
  },
];
