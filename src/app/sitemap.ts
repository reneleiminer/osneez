import type { MetadataRoute } from "next";

import { getCollections, getDrops, getProducts } from "@/lib/shop/queries";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, drops] = await Promise.all([
    getProducts(),
    getCollections(),
    getDrops(),
  ]);

  const staticRoutes = [
    "",
    "/shop",
    "/drops",
    "/collections",
    "/world",
    "/about",
    "/contact",
    "/shipping",
    "/returns",
    "/terms",
  ].map((path) => ({
    url: `${SITE.url}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...staticRoutes,
    ...products.map((product) => ({
      url: `${SITE.url}/shop/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...collections.map((collection) => ({
      url: `${SITE.url}/collections/${collection.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...drops.map((drop) => ({
      url: `${SITE.url}/drops/${drop.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
