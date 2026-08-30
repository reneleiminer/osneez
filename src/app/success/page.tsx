import type { Metadata } from "next";
import Link from "next/link";

import { ClearBag } from "@/components/cart/clear-bag";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

type SessionSummary = {
  email: string | null;
  total: number | null;
  reference: string | null;
};

/**
 * Reads the completed Checkout Session for a confirmation summary. Runs only
 * on the server and degrades to a generic confirmation if Stripe is not
 * configured or the session cannot be read.
 */
async function loadSession(sessionId?: string): Promise<SessionSummary | null> {
  if (!sessionId || !process.env.STRIPE_SECRET_KEY) return null;
  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      email: session.customer_details?.email ?? null,
      total: session.amount_total ?? null,
      reference: session.id.slice(-8).toUpperCase(),
    };
  } catch (error) {
    console.error("[osneez] could not read checkout session:", error);
    return null;
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const summary = await loadSession(sessionId);

  return (
    <div className="os-edge flex min-h-[70svh] flex-col justify-center py-20">
      <ClearBag />
      <p className="os-eyebrow text-signal">Payment received</p>
      <h1 className="os-display mt-4 text-[clamp(3rem,13vw,10rem)] leading-[0.78]">
        You&apos;re
        <br />
        in.
      </h1>

      <p className="mt-8 max-w-[46ch] text-sm leading-relaxed text-smoke">
        Danke für deine Order. Bestätigung und Rechnung kommen per E-Mail
        {summary?.email ? ` an ${summary.email}` : ""}. Sobald dein Paket
        rausgeht, bekommst du den Tracking-Link.
      </p>

      {summary ? (
        <dl className="mt-10 grid max-w-md gap-px bg-bone/10">
          <div className="flex items-baseline justify-between bg-void py-4">
            <dt className="os-label text-[0.625rem] text-smoke">Reference</dt>
            <dd className="text-xs tabular-nums">{summary.reference}</dd>
          </div>
          {summary.total !== null ? (
            <div className="flex items-baseline justify-between bg-void py-4">
              <dt className="os-label text-[0.625rem] text-smoke">Total</dt>
              <dd className="text-xs tabular-nums">
                {formatPrice(summary.total)}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/shop" className="os-btn os-btn-primary">
          Keep shopping
          <span aria-hidden="true">→</span>
        </Link>
        <Link href="/world" className="os-btn os-btn-ghost">
          Enter OSNEEZ World
        </Link>
      </div>
    </div>
  );
}
