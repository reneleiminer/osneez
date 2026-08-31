import { ImageResponse } from "next/og";

import { formatPrice } from "@/lib/format";
import { displayFontOptions, loadDisplayFont } from "@/lib/og-font";
import { categoryLabel, visualSeed } from "@/lib/shop/product";
import { getProductBySlug } from "@/lib/shop/queries";

export const alt = "OSNEEZ product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Per-product share card. Uses the same generated artwork language as the
 * placeholder frames on the site, so a shared link looks like the page it
 * opens.
 */
export default async function ProductOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, font] = await Promise.all([
    getProductBySlug(slug),
    loadDisplayFont(),
  ]);

  const hash = visualSeed(slug);
  const glowX = 15 + (hash % 55);
  const glowY = 20 + ((hash >> 4) % 50);
  const name = product?.name ?? "OSNEEZ";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#08080a",
          backgroundImage: `radial-gradient(60% 70% at ${glowX}% ${glowY}%, rgba(228,38,28,0.26) 0%, rgba(8,8,10,0) 62%), linear-gradient(155deg, #16181c 0%, #08080a 65%)`,
          color: "#e9e5dc",
          fontFamily: "Anton, sans-serif",
          textTransform: "uppercase",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: 7,
            color: "#8b9098",
          }}
        >
          <span>OSNEEZ®</span>
          <span>
            {product ? categoryLabel(product.category) : "Shop"}
            {product?.badge ? ` — ${product.badge}` : ""}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: name.length > 18 ? 108 : 140,
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            {name}
          </div>
          <div
            style={{
              display: "flex",
              width: 180,
              height: 9,
              marginTop: 24,
              backgroundColor: "#e4261c",
            }}
          />
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 48,
              letterSpacing: 2,
              color: "#8b9098",
            }}
          >
            {product
              ? `${product.subtitle ? `${product.subtitle} — ` : ""}${formatPrice(product.price)}`
              : "Built after dark."}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 6,
            color: "#8b9098",
          }}
        >
          Built after dark — limited run
        </div>
      </div>
    ),
    { ...size, fonts: displayFontOptions(font) },
  );
}
