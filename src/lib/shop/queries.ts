import "server-only";

import type {
  CategorySlug,
  Collection,
  Drop,
  Product,
  WorldStory,
} from "@/types/shop";

import { getSupabaseReadClient } from "@/lib/supabase/server";
import {
  SEED_COLLECTIONS,
  SEED_DROPS,
  SEED_PRODUCTS,
  SEED_WORLD,
} from "./seed";

const PRODUCT_SELECT =
  "*, images:product_images(*), variants:product_variants(*)";

function sortProduct(product: Product): Product {
  return {
    ...product,
    images: [...(product.images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
    variants: [...(product.variants ?? [])].filter((variant) => variant.active),
  };
}

/**
 * Every query degrades gracefully: if Supabase is missing, unreachable or the
 * table is still empty, the bundled seed catalogue is used instead. Errors are
 * logged once and never bubble up into the render tree.
 */
async function withFallback<T>(
  label: string,
  run: () => Promise<T | null>,
  fallback: T,
): Promise<T> {
  const client = getSupabaseReadClient();
  if (!client) return fallback;
  try {
    const result = await run();
    return result ?? fallback;
  } catch (error) {
    console.error(`[osneez] Supabase query "${label}" failed:`, error);
    return fallback;
  }
}

export type ProductFilter = {
  category?: CategorySlug | null;
  collectionSlug?: string | null;
  dropSlug?: string | null;
  featured?: boolean;
  limit?: number;
};

function filterSeed(filter: ProductFilter): Product[] {
  let list = SEED_PRODUCTS.filter((product) => product.active);
  if (filter.category) {
    list = list.filter((product) => product.category === filter.category);
  }
  if (filter.collectionSlug) {
    const collection = SEED_COLLECTIONS.find(
      (entry) => entry.slug === filter.collectionSlug,
    );
    list = collection
      ? list.filter((product) => product.collection_id === collection.id)
      : [];
  }
  if (filter.dropSlug) {
    const drop = SEED_DROPS.find((entry) => entry.slug === filter.dropSlug);
    list = drop ? list.filter((product) => product.drop_id === drop.id) : [];
  }
  if (filter.featured) {
    list = list.filter((product) => product.featured);
  }
  return filter.limit ? list.slice(0, filter.limit) : list;
}

export async function getProducts(
  filter: ProductFilter = {},
): Promise<Product[]> {
  return withFallback(
    "getProducts",
    async () => {
      const client = getSupabaseReadClient();
      if (!client) return null;

      let collectionId: string | null = null;
      if (filter.collectionSlug) {
        const { data } = await client
          .from("collections")
          .select("id")
          .eq("slug", filter.collectionSlug)
          .maybeSingle();
        if (!data) return [];
        collectionId = data.id as string;
      }

      let dropId: string | null = null;
      if (filter.dropSlug) {
        const { data } = await client
          .from("drops")
          .select("id")
          .eq("slug", filter.dropSlug)
          .maybeSingle();
        if (!data) return [];
        dropId = data.id as string;
      }

      let query = client
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("active", true)
        .order("created_at", { ascending: true });

      if (filter.category) query = query.eq("category", filter.category);
      if (collectionId) query = query.eq("collection_id", collectionId);
      if (dropId) query = query.eq("drop_id", dropId);
      if (filter.featured) query = query.eq("featured", true);
      if (filter.limit) query = query.limit(filter.limit);

      const { data, error } = await query;
      if (error) throw error;
      if (!data?.length) return null;
      return (data as unknown as Product[]).map(sortProduct);
    },
    filterSeed(filter),
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const seed = SEED_PRODUCTS.find((product) => product.slug === slug) ?? null;
  return withFallback(
    "getProductBySlug",
    async () => {
      const client = getSupabaseReadClient();
      if (!client) return null;
      const { data, error } = await client
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return sortProduct(data as unknown as Product);
    },
    seed,
  );
}

export async function getCollections(): Promise<Collection[]> {
  return withFallback(
    "getCollections",
    async () => {
      const client = getSupabaseReadClient();
      if (!client) return null;
      const { data, error } = await client
        .from("collections")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data?.length ? (data as Collection[]) : null;
    },
    SEED_COLLECTIONS,
  );
}

export async function getCollectionBySlug(
  slug: string,
): Promise<Collection | null> {
  const collections = await getCollections();
  return collections.find((collection) => collection.slug === slug) ?? null;
}

export async function getDrops(): Promise<Drop[]> {
  return withFallback(
    "getDrops",
    async () => {
      const client = getSupabaseReadClient();
      if (!client) return null;
      const { data, error } = await client
        .from("drops")
        .select("*")
        .eq("active", true)
        .order("release_date", { ascending: false });
      if (error) throw error;
      return data?.length ? (data as Drop[]) : null;
    },
    SEED_DROPS,
  );
}

export async function getDropBySlug(slug: string): Promise<Drop | null> {
  const drops = await getDrops();
  return drops.find((drop) => drop.slug === slug) ?? null;
}

export async function getCurrentDrop(): Promise<Drop | null> {
  const drops = await getDrops();
  const released = drops.filter(
    (drop) => drop.release_date && new Date(drop.release_date) <= new Date(),
  );
  return released[0] ?? drops[0] ?? null;
}

export async function getUpcomingDrops(): Promise<Drop[]> {
  const drops = await getDrops();
  return drops.filter(
    (drop) => drop.release_date && new Date(drop.release_date) > new Date(),
  );
}

export async function getWorldStories(): Promise<WorldStory[]> {
  return withFallback(
    "getWorldStories",
    async () => {
      const client = getSupabaseReadClient();
      if (!client) return null;
      const { data, error } = await client
        .from("world_stories")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data?.length ? (data as WorldStory[]) : null;
    },
    SEED_WORLD,
  );
}

export async function searchProducts(term: string): Promise<Product[]> {
  const needle = term.trim().toLowerCase();
  if (needle.length < 2) return [];
  const all = await getProducts();
  return all
    .filter((product) =>
      [product.name, product.subtitle, product.category, product.slug]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle)),
    )
    .slice(0, 8);
}
