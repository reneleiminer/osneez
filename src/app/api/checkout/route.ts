import Stripe from "stripe";
import { z } from "zod";

import { getSettings } from "@/lib/settings";
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
  const freeShipping = result.subtotal >= settings.free_shipping_threshold;

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
        allowed_countries:
          settings.shipping_countries as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: freeShipping ? 0 : settings.shipping_rate,
              currency: "eur",
            },
            display_name: freeShipping
              ? "Kostenloser Versand"
              : "Standardversand",
            tax_behavior: "inclusive",
            delivery_estimate: {
              minimum: { unit: "business_day", value: settings.delivery_min_days },
              maximum: { unit: "business_day", value: settings.delivery_max_days },
            },
          },
        },
      ],
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
