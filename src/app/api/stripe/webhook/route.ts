import Stripe from "stripe";

import { alreadySent, sendEmail } from "@/lib/email/send";
import { orderConfirmationEmail } from "@/lib/email/templates";
import { getSettings } from "@/lib/settings";
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

  const { data: saved, error } = await supabase.from("orders").upsert(
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
  )
    .select("id")
    .single();

  if (error) {
    console.error("[osneez] order upsert failed:", error);
    // 500 makes Stripe retry the delivery.
    return Response.json({ error: "Order sync failed." }, { status: 500 });
  }

  // Order confirmation. Sent once per order and never allowed to fail the
  // webhook — Stripe would otherwise retry a payment we already recorded.
  const settings = await getSettings();
  const orderId = saved?.id as string | undefined;
  if (
    orderId &&
    settings.email_order_confirmation &&
    session.payment_status === "paid" &&
    session.customer_details?.email &&
    !(await alreadySent(orderId, "order_confirmation"))
  ) {
    const mail = orderConfirmationEmail(settings, {
      reference: session.id.slice(-8).toUpperCase(),
      amountTotal: session.amount_total ?? 0,
      lines: (items?.data ?? []).map((item) => ({
        description: item.description ?? "Artikel",
        quantity: item.quantity ?? 1,
      })),
    });
    await sendEmail({ ...mail, to: session.customer_details.email, template: "order_confirmation", orderId });
  }

  return Response.json({ received: true, stored: true });
}
