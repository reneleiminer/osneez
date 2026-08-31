import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Collection, Drop, Product, WorldStory } from "@/types/shop";

/**
 * Admin reads go through the service-role client so drafts, inactive products
 * and orders are visible — RLS hides all of that from the public client.
 * Every caller sits behind requireAdmin().
 */

export type AdminOrder = {
  id: string;
  stripe_session_id: string;
  email: string | null;
  customer_name: string | null;
  amount_total: number;
  currency: string;
  payment_status: string | null;
  status: string;
  line_items: { description: string; quantity: number }[] | null;
  created_at: string;
};

export type AdminSubscriber = {
  id: string;
  email: string;
  source: string;
  active: boolean;
  created_at: string;
};

export function isWritable(): boolean {
  return getSupabaseAdminClient() !== null;
}

export async function listProducts(): Promise<Product[]> {
  const db = getSupabaseAdminClient();
  if (!db) return [];
  const { data, error } = await db
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
  const db = getSupabaseAdminClient();
  if (!db) return null;
  const { data, error } = await db
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as Product) ?? null;
}

export async function listCollections(): Promise<Collection[]> {
  const db = getSupabaseAdminClient();
  if (!db) return [];
  const { data, error } = await db
    .from("collections")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Collection[];
}

export async function listDrops(): Promise<Drop[]> {
  const db = getSupabaseAdminClient();
  if (!db) return [];
  const { data, error } = await db
    .from("drops")
    .select("*")
    .order("release_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Drop[];
}

export async function listWorldStories(): Promise<WorldStory[]> {
  const db = getSupabaseAdminClient();
  if (!db) return [];
  const { data, error } = await db
    .from("world_stories")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as WorldStory[];
}

export async function listOrders(): Promise<AdminOrder[]> {
  const db = getSupabaseAdminClient();
  if (!db) return [];
  const { data, error } = await db
    .from("orders")
    .select(
      "id, stripe_session_id, email, customer_name, amount_total, currency, payment_status, status, line_items, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminOrder[];
}

export async function listSubscribers(): Promise<AdminSubscriber[]> {
  const db = getSupabaseAdminClient();
  if (!db) return [];
  const { data, error } = await db
    .from("newsletter_subscribers")
    .select("id, email, source, active, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminSubscriber[];
}

export async function dashboardCounts() {
  const db = getSupabaseAdminClient();
  if (!db) {
    return { products: 0, orders: 0, revenue: 0, subscribers: 0, lowStock: 0 };
  }

  const count = async (table: string) => {
    const { count: value } = await db
      .from(table)
      .select("*", { count: "exact", head: true });
    return value ?? 0;
  };

  const [products, orders, subscribers] = await Promise.all([
    count("products"),
    count("orders"),
    count("newsletter_subscribers"),
  ]);

  const { data: paid } = await db
    .from("orders")
    .select("amount_total")
    .eq("status", "paid");
  const revenue = (paid ?? []).reduce(
    (sum, row) => sum + ((row.amount_total as number) ?? 0),
    0,
  );

  const { count: lowStock } = await db
    .from("product_variants")
    .select("*", { count: "exact", head: true })
    .lte("stock", 3);

  return { products, orders, revenue, subscribers, lowStock: lowStock ?? 0 };
}
