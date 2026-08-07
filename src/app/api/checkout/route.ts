import Stripe from "stripe";
import { z } from "zod";
import { products } from "@/lib/catalog";

const payload = z.object({ items: z.array(z.object({ id: z.string(), size: z.string(), quantity: z.number().int().min(1).max(10) })).min(1).max(20) });

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return Response.json({ error: "Stripe ist noch nicht eingerichtet. Bitte hinterlege STRIPE_SECRET_KEY in .env.local." }, { status: 503 });
  const parsed = payload.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Ungültiger Warenkorb." }, { status: 400 });
  const lineItems = parsed.data.items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.id);
    if (!product || !product.sizes.includes(item.size as never)) throw new Error("Ein Artikel ist nicht verfügbar.");
    return {
      price_data: {
        currency: "eur",
        product_data: { name: product.name, metadata: { product_id: product.id, size: item.size } },
        unit_amount: product.price,
        // OSNEEZ storefront prices are displayed as VAT-inclusive consumer prices.
        tax_behavior: "inclusive" as const,
      },
      quantity: item.quantity,
    };
  });
  const subtotal = lineItems.reduce((total, item) => total + item.price_data.unit_amount * item.quantity, 0);
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) return Response.json({ error: "NEXT_PUBLIC_SITE_URL fehlt." }, { status: 500 });
  const stripe = new Stripe(secret);
  const isFreeShipping = subtotal >= 12_000;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    automatic_tax: { enabled: true },
    billing_address_collection: "required",
    shipping_address_collection: { allowed_countries: ["AT", "BE", "CH", "DE", "DK", "ES", "FR", "IT", "LU", "NL", "PL", "SE"] },
    shipping_options: [{
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: { amount: isFreeShipping ? 0 : 490, currency: "eur" },
        display_name: isFreeShipping ? "Kostenloser Versand" : "Standardversand",
        tax_behavior: "inclusive",
        delivery_estimate: { minimum: { unit: "business_day", value: 2 }, maximum: { unit: "business_day", value: 5 } },
      },
    }],
    phone_number_collection: { enabled: true },
    allow_promotion_codes: true,
    invoice_creation: { enabled: true },
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#shop`,
    metadata: { source: "osneez-store" },
  });
  return Response.json({ url: session.url });
}
