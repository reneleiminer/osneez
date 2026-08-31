import "server-only";

import type { User } from "@supabase/supabase-js";

import { createAuthClient } from "@/lib/supabase/auth";

export type CustomerOrder = {
  id: string;
  stripe_session_id: string;
  amount_total: number;
  status: string;
  payment_status: string | null;
  line_items: { description: string; quantity: number }[] | null;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  created_at: string;
};

/**
 * Any signed-in Supabase user. Staff accounts pass through here too — the
 * admin adds its own role check on top, so nothing leaks either way.
 */
export async function getCustomer(): Promise<User | null> {
  const supabase = await createAuthClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

/**
 * Orders belonging to the signed-in customer. Read through the user's own
 * session so the row level security policy — not this function — decides what
 * comes back.
 */
export async function getCustomerOrders(): Promise<CustomerOrder[]> {
  const supabase = await createAuthClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, stripe_session_id, amount_total, status, payment_status, line_items, carrier, tracking_number, tracking_url, shipped_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as CustomerOrder[];
  } catch (error) {
    console.error("[osneez] could not load customer orders:", error);
    return [];
  }
}
