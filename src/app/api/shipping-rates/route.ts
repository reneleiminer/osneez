import { ratesForCountry, shippableCountries } from "@/lib/shipping";

export const runtime = "nodejs";

/** Rates for the cart drawer: the customer sees the price before checkout. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const country = (params.get("country") ?? "DE").slice(0, 2).toUpperCase();
  const subtotal = Math.max(
    0,
    Number.parseInt(params.get("subtotal") ?? "0", 10) || 0,
  );

  try {
    const [rates, countries] = await Promise.all([
      ratesForCountry(country, subtotal),
      shippableCountries(),
    ]);
    return Response.json({ country, rates, countries });
  } catch (error) {
    console.error("[osneez] shipping rate lookup failed:", error);
    return Response.json({ country, rates: [], countries: [] }, { status: 500 });
  }
}
