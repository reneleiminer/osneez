import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  Discount,
  ReturnRequest,
  ShippingRate,
  ShippingZone,
  StaffMember,
} from "@/types/settings";
import type { Collection, Drop, Product, WorldStory } from "@/types/shop";

/**
 * Admin reads go through the service-role client so drafts, inactive products
 * and orders are visible — RLS hides all of that from the public client.
 * Every caller sits behind requireAdmin().
 *
 * Nothing in here throws. A migration that has not been run yet must show up
 * as an empty screen with a hint, not as a generic error page.
 */

async function safe<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  const db = getSupabaseAdminClient();
  if (!db) return fallback;
  try {
    return await run();
  } catch (error) {
    console.error(`[osneez] admin query "${label}" failed:`, error);
    return fallback;
  }
}

/** Tables introduced by a migration, mapped to the file that creates them. */
const TABLE_MIGRATIONS: Record<string, string> = {
  products: "0001_shop_schema.sql",
  settings: "0003_settings_and_legal.sql",
  legal_pages: "0003_settings_and_legal.sql",
  discounts: "0004_discounts_accounts_staff.sql",
  staff: "0004_discounts_accounts_staff.sql",
  shipping_zones: "0005_shipping_fulfilment_returns.sql",
  return_requests: "0005_shipping_fulfilment_returns.sql",
  email_log: "0006_email_and_carrier.sql",
};

export type MissingTable = { table: string; migration: string };

/**
 * Probes every expected table so the admin can name the missing migration
 * instead of failing with a blank error.
 */
export async function missingTables(): Promise<MissingTable[]> {
  const db = getSupabaseAdminClient();
  if (!db) return [];

  const checks = await Promise.all(
    Object.entries(TABLE_MIGRATIONS).map(async ([table, migration]) => {
      try {
        const { error } = await db
          .from(table)
          .select("*", { count: "exact", head: true });
        return error ? { table, migration } : null;
      } catch {
        return { table, migration };
      }
    }),
  );

  return checks.filter((entry): entry is MissingTable => entry !== null);
}

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
  shipping_details: unknown;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  internal_note: string | null;
  created_at: string;
};

export type AdminSubscriber = {
  id: string;
  email: string;
  source: string;
  active: boolean;
  created_at: string;
};

export type ZoneWithRates = ShippingZone & { rates: ShippingRate[] };

export function isWritable(): boolean {
  return getSupabaseAdminClient() !== null;
}

export async function listProducts(): Promise<Product[]> {
  return safe(
    "listProducts",
    async () => {
      const db = getSupabaseAdminClient()!;
      const { data, error } = await db
        .from("products")
        .select("*, images:product_images(*), variants:product_variants(*)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Product[];
    },
    [],
  );
}

export async function getProduct(id: string): Promise<Product | null> {
  return safe(
    "getProduct",
    async () => {
      const db = getSupabaseAdminClient()!;
      const { data, error } = await db
        .from("products")
        .select("*, images:product_images(*), variants:product_variants(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Product) ?? null;
    },
    null,
  );
}

export async function listCollections(): Promise<Collection[]> {
  return safe(
    "listCollections",
    async () => {
      const db = getSupabaseAdminClient()!;
      const { data, error } = await db
        .from("collections")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Collection[];
    },
    [],
  );
}

export async function listDrops(): Promise<Drop[]> {
  return safe(
    "listDrops",
    async () => {
      const db = getSupabaseAdminClient()!;
      const { data, error } = await db
        .from("drops")
        .select("*")
        .order("release_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Drop[];
    },
    [],
  );
}

export async function listWorldStories(): Promise<WorldStory[]> {
  return safe(
    "listWorldStories",
    async () => {
      const db = getSupabaseAdminClient()!;
      const { data, error } = await db
        .from("world_stories")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WorldStory[];
    },
    [],
  );
}

export async function listOrders(): Promise<AdminOrder[]> {
  return safe(
    "listOrders",
    async () => {
      const db = getSupabaseAdminClient()!;
      const { data, error } = await db
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as AdminOrder[];
    },
    [],
  );
}

export async function getOrder(id: string): Promise<AdminOrder | null> {
  return safe(
    "getOrder",
    async () => {
      const db = getSupabaseAdminClient()!;
      const { data, error } = await db
        .from("orders")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as AdminOrder) ?? null;
    },
    null,
  );
}

export async function listSubscribers(): Promise<AdminSubscriber[]> {
  return safe(
    "listSubscribers",
    async () => {
      const db = getSupabaseAdminClient()!;
      const { data, error } = await db
        .from("newsletter_subscribers")
        .select("id, email, source, active, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data ?? []) as AdminSubscriber[];
    },
    [],
  );
}

export async function listDiscounts(): Promise<Discount[]> {
  return safe(
    "listDiscounts",
    async () => {
      const db = getSupabaseAdminClient()!;
      const { data, error } = await db
        .from("discounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Discount[];
    },
    [],
  );
}

export async function listStaff(): Promise<StaffMember[]> {
  return safe(
    "listStaff",
    async () => {
      const db = getSupabaseAdminClient()!;
      const { data, error } = await db
        .from("staff")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as StaffMember[];
    },
    [],
  );
}

export async function listShippingZones(): Promise<ZoneWithRates[]> {
  return safe(
    "listShippingZones",
    async () => {
      const db = getSupabaseAdminClient()!;
      const { data, error } = await db
        .from("shipping_zones")
        .select("*, rates:shipping_rates(*)")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as unknown as ZoneWithRates[]).map((zone) => ({
        ...zone,
        rates: (zone.rates ?? []).sort((a, b) => a.sort_order - b.sort_order),
      }));
    },
    [],
  );
}

export async function listReturns(): Promise<ReturnRequest[]> {
  return safe(
    "listReturns",
    async () => {
      const db = getSupabaseAdminClient()!;
      const { data, error } = await db
        .from("return_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as ReturnRequest[];
    },
    [],
  );
}

export async function dashboardCounts() {
  const empty = {
    products: 0,
    orders: 0,
    revenue: 0,
    subscribers: 0,
    lowStock: 0,
  };

  return safe(
    "dashboardCounts",
    async () => {
      const db = getSupabaseAdminClient()!;

      const count = async (table: string) => {
        const { count: value, error } = await db
          .from(table)
          .select("*", { count: "exact", head: true });
        return error ? 0 : (value ?? 0);
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
    },
    empty,
  );
}

export type ReportBucket = { label: string; value: number; secondary?: number };

export type ReportData = {
  days: ReportBucket[];
  revenueTotal: number;
  orderCount: number;
  averageOrder: number;
  statuses: { status: string; count: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  lowStock: { product: string; size: string; stock: number }[];
  newsletterByMonth: ReportBucket[];
};

/** Everything the reports screen needs, in one pass over the tables. */
export async function reportData(days = 30): Promise<ReportData> {
  const empty: ReportData = {
    days: [],
    revenueTotal: 0,
    orderCount: 0,
    averageOrder: 0,
    statuses: [],
    topProducts: [],
    lowStock: [],
    newsletterByMonth: [],
  };

  return safe<ReportData>(
    "reportData",
    async () => {
      const db = getSupabaseAdminClient()!;

      const since = new Date();
      since.setDate(since.getDate() - (days - 1));
      since.setHours(0, 0, 0, 0);

      const [{ data: orders }, { data: variants }, { data: subscribers }] =
        await Promise.all([
          db
            .from("orders")
            .select("amount_total, status, line_items, created_at")
            .gte("created_at", since.toISOString())
            .order("created_at", { ascending: true }),
          db
            .from("product_variants")
            .select("size, stock, products(name)")
            .lte("stock", 3)
            .order("stock", { ascending: true })
            .limit(25),
          db
            .from("newsletter_subscribers")
            .select("created_at")
            .order("created_at", { ascending: true }),
        ]);

      const rows = (orders ?? []) as {
        amount_total: number;
        status: string;
        line_items:
          | { description: string; quantity: number; amount_total: number }[]
          | null;
        created_at: string;
      }[];

      // One bucket per day so gaps show as gaps instead of collapsing.
      const buckets = new Map<string, { value: number; secondary: number }>();
      for (let index = 0; index < days; index += 1) {
        const date = new Date(since);
        date.setDate(since.getDate() + index);
        buckets.set(date.toISOString().slice(0, 10), { value: 0, secondary: 0 });
      }

      const statuses = new Map<string, number>();
      const products = new Map<string, { quantity: number; revenue: number }>();
      let revenueTotal = 0;
      let paidCount = 0;

      for (const row of rows) {
        statuses.set(row.status, (statuses.get(row.status) ?? 0) + 1);
        if (row.status !== "paid" && row.status !== "fulfilled") continue;

        revenueTotal += row.amount_total ?? 0;
        paidCount += 1;

        const bucket = buckets.get(row.created_at.slice(0, 10));
        if (bucket) {
          bucket.value += row.amount_total ?? 0;
          bucket.secondary += 1;
        }

        for (const item of row.line_items ?? []) {
          const name = item.description ?? "—";
          const entry = products.get(name) ?? { quantity: 0, revenue: 0 };
          entry.quantity += item.quantity ?? 0;
          entry.revenue += item.amount_total ?? 0;
          products.set(name, entry);
        }
      }

      const monthly = new Map<string, number>();
      for (const row of (subscribers ?? []) as { created_at: string }[]) {
        const key = row.created_at.slice(0, 7);
        monthly.set(key, (monthly.get(key) ?? 0) + 1);
      }

      return {
        days: [...buckets.entries()].map(([label, entry]) => ({
          label,
          value: entry.value,
          secondary: entry.secondary,
        })),
        revenueTotal,
        orderCount: paidCount,
        averageOrder: paidCount ? Math.round(revenueTotal / paidCount) : 0,
        statuses: [...statuses.entries()]
          .map(([status, count]) => ({ status, count }))
          .sort((a, b) => b.count - a.count),
        topProducts: [...products.entries()]
          .map(([name, entry]) => ({ name, ...entry }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 8),
        lowStock: (
          (variants ?? []) as unknown as {
            size: string;
            stock: number;
            products: { name: string } | null;
          }[]
        ).map((variant) => ({
          product: variant.products?.name ?? "—",
          size: variant.size,
          stock: variant.stock,
        })),
        newsletterByMonth: [...monthly.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .slice(-12)
          .map(([label, value]) => ({ label, value })),
      };
    },
    empty,
  );
}
