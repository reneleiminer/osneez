import Stripe from "stripe";
import { z } from "zod";

import { getSettings } from "@/lib/settings";
import { ratesForCountry, shippableCountries } from "@/lib/shipping";
import { SITE } from "@/lib/site";
import { buildLineItems } from "@/lib/stripe/line-items";

export const runtime = "nodejs";

const payload = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().min(1).max(120),
        size: z.string().min(1).max(24),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(20),
  country: z.string().length(2).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const parsed = payload.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Ungültiger Warenkorb." }, { status: 400 });
  }

  // Prices, availability and stock are resolved server-side. The client never
  // supplies an amount.
  const result = await buildLineItems(parsed.data.items);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 409 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return Response.json(
      {
        error:
          "Stripe ist noch nicht eingerichtet. Bitte hinterlege STRIPE_SECRET_KEY in .env.local.",
      },
      { status: 503 },
    );
  }

  const settings = await getSettings();
  const origin = request.headers.get("origin") ?? SITE.url;

  // Shipping is resolved for the destination the customer picked in the cart.
  // The country list is then narrowed to that country so the rate shown and
  // the rate charged can never drift apart inside Stripe Checkout.
  const allCountries = await shippableCountries();
  const country = parsed.data.country?.toUpperCase();
  const destination = country && allCountries.includes(country) ? country : null;
  const rates = await ratesForCountry(destination ?? "DE", result.subtotal);

  try {
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: result.lineItems,
      // An empty list means "use whatever is enabled in the Stripe dashboard",
      // which is the recommended setup.
      ...(settings.payment_methods.length
        ? {
            payment_method_types:
              settings.payment_methods as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
          }
        : {}),
      automatic_tax: { enabled: settings.automatic_tax },
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: (destination
          ? [destination]
          : allCountries) as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
      },
      // Stripe accepts at most five options per session.
      shipping_options: rates.slice(0, 5).map((rate) => ({
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: { amount: rate.amount, currency: "eur" },
          display_name: rate.free ? `${rate.name} — gratis` : rate.name,
          tax_behavior: "inclusive" as const,
          delivery_estimate: {
            minimum: {
              unit: "business_day" as const,
              value: rate.deliveryMinDays,
            },
            maximum: {
              unit: "business_day" as const,
              value: rate.deliveryMaxDays,
            },
          },
        },
      })),
      phone_number_collection: { enabled: true },
      allow_promotion_codes: settings.promotion_codes,
      invoice_creation: { enabled: settings.invoice_creation },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop`,
      metadata: {
        source: "osneez-store",
        items: JSON.stringify(
          parsed.data.items.map(
            (item) => `${item.slug}:${item.size}x${item.quantity}`,
          ),
        ).slice(0, 480),
      },
    });

    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("[osneez] checkout session failed:", error);
    return Response.json(
      { error: "Checkout konnte nicht gestartet werden." },
      { status: 502 },
    );
  }
}
