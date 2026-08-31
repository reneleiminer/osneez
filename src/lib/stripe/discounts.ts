import "server-only";

import Stripe from "stripe";

function client(): Stripe | null {
  const secret = process.env.STRIPE_SECRET_KEY;
  return secret ? new Stripe(secret) : null;
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export type CreatedDiscount = {
  couponId: string;
  promotionCodeId: string;
};

/**
 * Creates a Stripe coupon plus the promotion code customers actually type.
 * Stripe stays the source of truth for redemption counts and limits — the
 * local table is only there to make the codes manageable from the admin.
 */
export async function createStripeDiscount(input: {
  code: string;
  kind: "percent" | "amount";
  value: number;
  minSubtotal: number | null;
  maxRedemptions: number | null;
  expiresAt: string | null;
}): Promise<CreatedDiscount> {
  const stripe = client();
  if (!stripe) throw new Error("STRIPE_SECRET_KEY fehlt.");

  const redeemBy = input.expiresAt
    ? Math.floor(new Date(input.expiresAt).getTime() / 1000)
    : undefined;

  const coupon = await stripe.coupons.create({
    name: input.code,
    duration: "once",
    ...(input.kind === "percent"
      ? { percent_off: input.value }
      : { amount_off: input.value, currency: "eur" }),
    ...(redeemBy ? { redeem_by: redeemBy } : {}),
  });

  const promotionCode = await stripe.promotionCodes.create({
    // Current API shape: the coupon sits inside `promotion`.
    promotion: { type: "coupon", coupon: coupon.id },
    code: input.code,
    active: true,
    ...(input.maxRedemptions ? { max_redemptions: input.maxRedemptions } : {}),
    ...(redeemBy ? { expires_at: redeemBy } : {}),
    ...(input.minSubtotal
      ? {
          restrictions: {
            minimum_amount: input.minSubtotal,
            minimum_amount_currency: "eur",
          },
        }
      : {}),
  });

  return { couponId: coupon.id, promotionCodeId: promotionCode.id };
}

export async function setStripeDiscountActive(
  promotionCodeId: string,
  active: boolean,
): Promise<void> {
  const stripe = client();
  if (!stripe) return;
  await stripe.promotionCodes.update(promotionCodeId, { active });
}

/** Deleting the coupon also disables every promotion code pointing at it. */
export async function deleteStripeDiscount(
  couponId: string | null,
): Promise<void> {
  const stripe = client();
  if (!stripe || !couponId) return;
  try {
    await stripe.coupons.del(couponId);
  } catch (error) {
    console.error("[osneez] could not delete Stripe coupon:", error);
  }
}

/** Live redemption counts keyed by promotion code id. */
export async function fetchRedemptions(): Promise<Record<string, number>> {
  const stripe = client();
  if (!stripe) return {};
  try {
    const codes = await stripe.promotionCodes.list({ limit: 100 });
    return Object.fromEntries(
      codes.data.map((code) => [code.id, code.times_redeemed]),
    );
  } catch (error) {
    console.error("[osneez] could not read promotion codes:", error);
    return {};
  }
}
