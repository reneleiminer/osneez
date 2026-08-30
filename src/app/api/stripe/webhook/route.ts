import Stripe from "stripe";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
// Stripe signature verification needs the untouched request body.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    return Response.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing signature." }, { status: 400 });
  }

  const stripe = new Stripe(secret);
  const raw = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      raw,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("[osneez] webhook signature verification failed:", error);
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded" &&
    event.type !== "checkout.session.async_payment_failed"
  ) {
    return Response.json({ received: true, ignored: event.type });
  }

  const session = event.data.object;
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    console.warn(
      "[osneez] order sync skipped: SUPABASE_SERVICE_ROLE_KEY is not set",
    );
    return Response.json({ received: true, stored: false });
  }

  let items: Stripe.ApiList<Stripe.LineItem> | null = null;
  try {
    items = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 50,
    });
  } catch (error) {
    console.error("[osneez] could not list line items:", error);
  }

  const { error } = await supabase.from("orders").upsert(
    {
      stripe_session_id: session.id,
      stripe_payment_intent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
      email: session.customer_details?.email ?? null,
      amount_total: session.amount_total ?? 0,
      amount_subtotal: session.amount_subtotal ?? 0,
      currency: session.currency ?? "eur",
      payment_status: session.payment_status,
      status:
        event.type === "checkout.session.async_payment_failed"
          ? "failed"
          : session.payment_status === "paid"
            ? "paid"
            : "pending",
      customer_name: session.customer_details?.name ?? null,
      shipping_details: session.collected_information?.shipping_details ?? null,
      line_items:
        items?.data.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          amount_total: item.amount_total,
        })) ?? null,
      metadata: session.metadata ?? null,
    },
    { onConflict: "stripe_session_id" },
  );

  if (error) {
    console.error("[osneez] order upsert failed:", error);
    // 500 makes Stripe retry the delivery.
    return Response.json({ error: "Order sync failed." }, { status: 500 });
  }

  return Response.json({ received: true, stored: true });
}
