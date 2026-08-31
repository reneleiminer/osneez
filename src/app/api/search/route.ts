import { buildSearchItems } from "@/lib/shop/product";
import { searchProducts } from "@/lib/shop/queries";

export const runtime = "nodejs";

/**
 * Search index on demand. Keeping it out of the layout means the storefront
 * shell stays synchronous — React drops suspending subtrees when rendering a
 * notFound() boundary, which would strip the chrome off every 404.
 */
export async function GET(request: Request) {
  const term = new URL(request.url).searchParams.get("q") ?? "";
  if (term.trim().length < 1) return Response.json({ items: [] });

  try {
    const items = buildSearchItems(await searchProducts(term));
    return Response.json(
      { items },
      { headers: { "Cache-Control": "public, max-age=60" } },
    );
  } catch (error) {
    console.error("[osneez] search failed:", error);
    return Response.json({ items: [] }, { status: 500 });
  }
}
