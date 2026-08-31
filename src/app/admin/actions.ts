"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  requireSection,
  createAuthClient,
  type AdminSection,
} from "@/lib/supabase/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";
import {
  createStripeDiscount,
  deleteStripeDiscount,
  setStripeDiscountActive,
  stripeConfigured,
} from "@/lib/stripe/discounts";

/**
 * Every mutation goes through here: the session is verified first, and only
 * then is the service-role client handed out. The service role bypasses RLS,
 * so this guard is the only thing standing between a request and the data.
 */
async function guard(section: AdminSection) {
  await requireSection(section);
  const db = getSupabaseAdminClient();
  if (!db) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY fehlt — Schreibzugriff ist nicht möglich.",
    );
  }
  return db;
}

function flush(path?: string) {
  // Storefront pages cache for 5 minutes; drop everything after an edit.
  revalidatePath("/", "layout");
  if (path) revalidatePath(path);
}

const str = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();

const nullable = (form: FormData, key: string) => str(form, key) || null;

const int = (form: FormData, key: string, fallback = 0) => {
  const value = Number.parseInt(str(form, key), 10);
  return Number.isFinite(value) ? value : fallback;
};

/** Price inputs are entered in euros and stored as cents. */
const cents = (form: FormData, key: string) => {
  const raw = str(form, key).replace(",", ".");
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
};

const centsOrNull = (form: FormData, key: string) =>
  str(form, key) ? cents(form, key) : null;

const bool = (form: FormData, key: string) => form.get(key) === "on";

// Not exported: a "use server" module may only export async functions.
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/* -------------------------------------------------------------------------- */
/* Session                                                                    */
/* -------------------------------------------------------------------------- */

export async function signIn(form: FormData) {
  const supabase = await createAuthClient();
  if (!supabase) {
    redirect("/admin/login?error=Supabase+ist+nicht+konfiguriert");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: str(form, "email"),
    password: String(form.get("password") ?? ""),
  });

  if (error) {
    redirect("/admin/login?error=Anmeldung+fehlgeschlagen");
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createAuthClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}

/* -------------------------------------------------------------------------- */
/* Products                                                                   */
/* -------------------------------------------------------------------------- */

export async function saveProduct(form: FormData) {
  const db = await guard("products");
  const id = nullable(form, "id");
  const name = str(form, "name");
  const slug = slugify(str(form, "slug") || name);

  const payload = {
    slug,
    name,
    subtitle: nullable(form, "subtitle"),
    description: nullable(form, "description"),
    material: nullable(form, "material"),
    fit: nullable(form, "fit"),
    details: nullable(form, "details"),
    price: cents(form, "price"),
    compare_at_price: centsOrNull(form, "compare_at_price"),
    category: str(form, "category"),
    status: str(form, "status"),
    badge: nullable(form, "badge"),
    collection_id: nullable(form, "collection_id"),
    drop_id: nullable(form, "drop_id"),
    active: bool(form, "active"),
    featured: bool(form, "featured"),
  };

  if (id) {
    const { error } = await db.from("products").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
    flush(`/shop/${slug}`);
    redirect(`/admin/products/${id}?saved=1`);
  }

  const { data, error } = await db
    .from("products")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  flush();
  redirect(`/admin/products/${data.id}?saved=1`);
}

export async function deleteProduct(form: FormData) {
  const db = await guard("products");
  const { error } = await db
    .from("products")
    .delete()
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  flush();
  redirect("/admin/products");
}

export async function saveVariant(form: FormData) {
  const db = await guard("products");
  const id = nullable(form, "id");
  const productId = str(form, "product_id");
  const size = str(form, "size");
  const color = str(form, "color");

  const payload = {
    product_id: productId,
    size,
    color,
    stock: Math.max(0, int(form, "stock")),
    active: bool(form, "active"),
    sku:
      str(form, "sku") ||
      `OSN-${slugify(str(form, "product_slug")).toUpperCase().slice(0, 6)}-${size.replace(/\s+/g, "")}`,
  };

  const { error } = id
    ? await db.from("product_variants").update(payload).eq("id", id)
    : await db.from("product_variants").insert(payload);
  if (error) throw new Error(error.message);

  flush();
  redirect(`/admin/products/${productId}`);
}

export async function deleteVariant(form: FormData) {
  const db = await guard("products");
  const productId = str(form, "product_id");
  const { error } = await db
    .from("product_variants")
    .delete()
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  flush();
  redirect(`/admin/products/${productId}`);
}

/* -------------------------------------------------------------------------- */
/* Product images                                                             */
/* -------------------------------------------------------------------------- */

export async function uploadProductImage(form: FormData) {
  const db = await guard("products");
  const productId = str(form, "product_id");
  const productSlug = slugify(str(form, "product_slug")) || productId;
  const file = form.get("file");

  if (!(file instanceof File) || file.size === 0) {
    redirect(`/admin/products/${productId}?error=Keine+Datei+gewählt`);
  }
  if (!file.type.startsWith("image/")) {
    redirect(`/admin/products/${productId}?error=Nur+Bilddateien+erlaubt`);
  }
  if (file.size > 8 * 1024 * 1024) {
    redirect(`/admin/products/${productId}?error=Bild+ist+größer+als+8+MB`);
  }

  const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${productSlug}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await db.storage
    .from(STORAGE_BUCKETS.products)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = db.storage.from(STORAGE_BUCKETS.products).getPublicUrl(path);

  const { error } = await db.from("product_images").insert({
    product_id: productId,
    image_url: publicUrl,
    alt: str(form, "alt"),
    type: str(form, "type") || "front",
    sort_order: int(form, "sort_order"),
  });
  if (error) throw new Error(error.message);

  flush();
  redirect(`/admin/products/${productId}?saved=1`);
}

export async function deleteProductImage(form: FormData) {
  const db = await guard("products");
  const productId = str(form, "product_id");
  const url = str(form, "image_url");

  // Remove the stored object as well so the bucket does not collect orphans.
  const marker = `/${STORAGE_BUCKETS.products}/`;
  const index = url.indexOf(marker);
  if (index !== -1) {
    const path = url.slice(index + marker.length);
    await db.storage.from(STORAGE_BUCKETS.products).remove([path]);
  }

  const { error } = await db
    .from("product_images")
    .delete()
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);

  flush();
  redirect(`/admin/products/${productId}`);
}

/* -------------------------------------------------------------------------- */
/* Collections, drops, world                                                  */
/* -------------------------------------------------------------------------- */

export async function saveCollection(form: FormData) {
  const db = await guard("collections");
  const id = nullable(form, "id");
  const payload = {
    slug: slugify(str(form, "slug") || str(form, "name")),
    name: str(form, "name"),
    description: nullable(form, "description"),
    cover_image: nullable(form, "cover_image"),
    sort_order: int(form, "sort_order"),
    active: bool(form, "active"),
  };
  const { error } = id
    ? await db.from("collections").update(payload).eq("id", id)
    : await db.from("collections").insert(payload);
  if (error) throw new Error(error.message);
  flush();
  redirect("/admin/collections?saved=1");
}

export async function deleteCollection(form: FormData) {
  const db = await guard("collections");
  const { error } = await db
    .from("collections")
    .delete()
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  flush();
  redirect("/admin/collections");
}

export async function saveDrop(form: FormData) {
  const db = await guard("drops");
  const id = nullable(form, "id");
  const release = str(form, "release_date");
  const payload = {
    slug: slugify(str(form, "slug") || str(form, "name")),
    name: str(form, "name"),
    tagline: nullable(form, "tagline"),
    description: nullable(form, "description"),
    release_date: release ? new Date(release).toISOString() : null,
    hero_image: nullable(form, "hero_image"),
    hero_video: nullable(form, "hero_video"),
    active: bool(form, "active"),
  };
  const { error } = id
    ? await db.from("drops").update(payload).eq("id", id)
    : await db.from("drops").insert(payload);
  if (error) throw new Error(error.message);
  flush();
  redirect("/admin/drops?saved=1");
}

export async function deleteDrop(form: FormData) {
  const db = await guard("drops");
  const { error } = await db.from("drops").delete().eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  flush();
  redirect("/admin/drops");
}

export async function saveWorldStory(form: FormData) {
  const db = await guard("world");
  const id = nullable(form, "id");
  const published = str(form, "published_at");
  const payload = {
    slug: slugify(str(form, "slug") || str(form, "title")),
    title: str(form, "title"),
    location: str(form, "location"),
    timestamp_label: str(form, "timestamp_label"),
    excerpt: str(form, "excerpt"),
    cover_image: nullable(form, "cover_image"),
    published_at: published
      ? new Date(published).toISOString()
      : new Date().toISOString(),
  };
  const { error } = id
    ? await db.from("world_stories").update(payload).eq("id", id)
    : await db.from("world_stories").insert(payload);
  if (error) throw new Error(error.message);
  flush();
  redirect("/admin/world?saved=1");
}

export async function deleteWorldStory(form: FormData) {
  const db = await guard("world");
  const { error } = await db
    .from("world_stories")
    .delete()
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  flush();
  redirect("/admin/world");
}

/* -------------------------------------------------------------------------- */
/* Orders and newsletter                                                      */
/* -------------------------------------------------------------------------- */

export async function updateOrderStatus(form: FormData) {
  const db = await guard("orders");
  const { error } = await db
    .from("orders")
    .update({ status: str(form, "status") })
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

export async function toggleSubscriber(form: FormData) {
  const db = await guard("newsletter");
  const { error } = await db
    .from("newsletter_subscribers")
    .update({ active: str(form, "active") === "true" })
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter");
}

/* -------------------------------------------------------------------------- */
/* Company settings                                                           */
/* -------------------------------------------------------------------------- */

/** Comma or newline separated input → trimmed array. */
function list(form: FormData, key: string): string[] {
  return str(form, key)
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

async function patchSettings(patch: Record<string, unknown>, section: string) {
  const db = await guard("settings");
  const { error } = await db
    .from("settings")
    .update(patch)
    .eq("id", "default");
  if (error) throw new Error(error.message);
  flush();
  redirect(`/admin/settings?saved=${section}`);
}

export async function saveCompanySettings(form: FormData) {
  await patchSettings(
    {
      legal_name: nullable(form, "legal_name"),
      legal_form: nullable(form, "legal_form"),
      street: nullable(form, "street"),
      postal_code: nullable(form, "postal_code"),
      city: nullable(form, "city"),
      country: nullable(form, "country"),
      representative: nullable(form, "representative"),
      register_court: nullable(form, "register_court"),
      register_number: nullable(form, "register_number"),
      vat_id: nullable(form, "vat_id"),
      small_business: bool(form, "small_business"),
      responsible_person: nullable(form, "responsible_person"),
      contact_email: nullable(form, "contact_email"),
      support_email: nullable(form, "support_email"),
      press_email: nullable(form, "press_email"),
      phone: nullable(form, "phone"),
    },
    "company",
  );
}

export async function saveShopSettings(form: FormData) {
  await patchSettings(
    {
      announcements: list(form, "announcements"),
      instagram_url: nullable(form, "instagram_url"),
      tiktok_url: nullable(form, "tiktok_url"),
      hero_video_url: nullable(form, "hero_video_url"),
      hero_image_url: nullable(form, "hero_image_url"),
    },
    "shop",
  );
}

export async function saveShippingSettings(form: FormData) {
  await patchSettings(
    {
      free_shipping_threshold: cents(form, "free_shipping_threshold"),
      shipping_rate: cents(form, "shipping_rate"),
      shipping_countries: list(form, "shipping_countries").map((code) =>
        code.toUpperCase().slice(0, 2),
      ),
      delivery_min_days: Math.max(0, int(form, "delivery_min_days", 2)),
      delivery_max_days: Math.max(0, int(form, "delivery_max_days", 5)),
    },
    "shipping",
  );
}

export async function savePaymentSettings(form: FormData) {
  const methods = form
    .getAll("payment_methods")
    .map((value) => String(value).trim())
    .filter(Boolean);

  await patchSettings(
    {
      payment_methods: methods,
      automatic_tax: bool(form, "automatic_tax"),
      promotion_codes: bool(form, "promotion_codes"),
      invoice_creation: bool(form, "invoice_creation"),
    },
    "payments",
  );
}

/* -------------------------------------------------------------------------- */
/* Legal pages                                                                */
/* -------------------------------------------------------------------------- */

export async function saveLegalPage(form: FormData) {
  const db = await guard("legal");
  const slug = str(form, "slug");
  const { error } = await db.from("legal_pages").upsert(
    {
      slug,
      title: str(form, "title"),
      intro: nullable(form, "intro"),
      body: String(form.get("body") ?? ""),
      draft: bool(form, "draft"),
    },
    { onConflict: "slug" },
  );
  if (error) throw new Error(error.message);
  flush(`/${slug}`);
  redirect(`/admin/legal/${slug}?saved=1`);
}

export async function resetLegalPage(form: FormData) {
  const db = await guard("legal");
  const slug = str(form, "slug");
  const { error } = await db.from("legal_pages").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  flush(`/${slug}`);
  redirect(`/admin/legal/${slug}?reset=1`);
}

/* -------------------------------------------------------------------------- */
/* Discounts                                                                  */
/* -------------------------------------------------------------------------- */

export async function createDiscount(form: FormData) {
  const db = await guard("discounts");
  const code = str(form, "code").toUpperCase().replace(/\s+/g, "");
  const kind = str(form, "kind") === "amount" ? "amount" : "percent";
  const rawValue = str(form, "value").replace(",", ".");
  const value =
    kind === "percent"
      ? Math.round(Number.parseFloat(rawValue))
      : Math.round(Number.parseFloat(rawValue) * 100);

  if (!code) redirect("/admin/discounts?error=Code+fehlt");
  if (!Number.isFinite(value) || value <= 0) {
    redirect("/admin/discounts?error=Ungültiger+Wert");
  }
  if (kind === "percent" && value > 100) {
    redirect("/admin/discounts?error=Prozentwert+über+100");
  }

  const minSubtotal = str(form, "min_subtotal") ? cents(form, "min_subtotal") : null;
  const maxRedemptions = str(form, "max_redemptions")
    ? Math.max(1, int(form, "max_redemptions", 1))
    : null;
  const expiresRaw = str(form, "expires_at");
  const expiresAt = expiresRaw ? new Date(expiresRaw).toISOString() : null;

  let couponId: string | null = null;
  let promotionCodeId: string | null = null;

  if (stripeConfigured()) {
    try {
      const created = await createStripeDiscount({
        code,
        kind,
        value,
        minSubtotal,
        maxRedemptions,
        expiresAt,
      });
      couponId = created.couponId;
      promotionCodeId = created.promotionCodeId;
    } catch (error) {
      console.error("[osneez] Stripe discount creation failed:", error);
      redirect("/admin/discounts?error=Stripe+hat+den+Code+abgelehnt");
    }
  }

  const { error } = await db.from("discounts").insert({
    code,
    description: nullable(form, "description"),
    kind,
    value,
    min_subtotal: minSubtotal,
    max_redemptions: maxRedemptions,
    expires_at: expiresAt,
    active: true,
    stripe_coupon_id: couponId,
    stripe_promotion_code_id: promotionCodeId,
  });
  if (error) {
    redirect(`/admin/discounts?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/discounts");
  redirect("/admin/discounts?saved=1");
}

export async function toggleDiscount(form: FormData) {
  const db = await guard("discounts");
  const id = str(form, "id");
  const active = str(form, "active") === "true";
  const promotionCodeId = nullable(form, "stripe_promotion_code_id");

  if (promotionCodeId && stripeConfigured()) {
    try {
      await setStripeDiscountActive(promotionCodeId, active);
    } catch (error) {
      console.error("[osneez] could not update promotion code:", error);
    }
  }

  const { error } = await db.from("discounts").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/discounts");
  redirect("/admin/discounts");
}

export async function deleteDiscount(form: FormData) {
  const db = await guard("discounts");
  await deleteStripeDiscount(nullable(form, "stripe_coupon_id"));
  const { error } = await db
    .from("discounts")
    .delete()
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/discounts");
  redirect("/admin/discounts");
}

/* -------------------------------------------------------------------------- */
/* Staff                                                                      */
/* -------------------------------------------------------------------------- */

export async function saveStaff(form: FormData) {
  const db = await guard("staff");
  const email = str(form, "email").toLowerCase();
  const role = str(form, "role");

  if (!email.includes("@")) {
    redirect("/admin/staff?error=Ungültige+E-Mail-Adresse");
  }
  if (!["owner", "editor", "fulfilment"].includes(role)) {
    redirect("/admin/staff?error=Unbekannte+Rolle");
  }

  const { error } = await db.from("staff").upsert(
    {
      email,
      name: nullable(form, "name"),
      role,
      active: bool(form, "active"),
    },
    { onConflict: "email" },
  );
  if (error) {
    redirect(`/admin/staff?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/staff");
  redirect("/admin/staff?saved=1");
}

export async function deleteStaff(form: FormData) {
  const db = await guard("staff");
  const { error } = await db.from("staff").delete().eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

/* -------------------------------------------------------------------------- */
/* Shipping zones and rates                                                   */
/* -------------------------------------------------------------------------- */

export async function saveShippingZone(form: FormData) {
  const db = await guard("shipping");
  const id = nullable(form, "id");
  const payload = {
    name: str(form, "name"),
    countries: list(form, "countries").map((code) =>
      code.toUpperCase().slice(0, 2),
    ),
    sort_order: int(form, "sort_order"),
    active: bool(form, "active"),
  };
  const { error } = id
    ? await db.from("shipping_zones").update(payload).eq("id", id)
    : await db.from("shipping_zones").insert(payload);
  if (error) throw new Error(error.message);
  flush();
  redirect("/admin/shipping?saved=1");
}

export async function deleteShippingZone(form: FormData) {
  const db = await guard("shipping");
  const { error } = await db
    .from("shipping_zones")
    .delete()
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  flush();
  redirect("/admin/shipping");
}

export async function saveShippingRate(form: FormData) {
  const db = await guard("shipping");
  const id = nullable(form, "id");
  const payload = {
    zone_id: str(form, "zone_id"),
    name: str(form, "name"),
    description: nullable(form, "description"),
    price: cents(form, "price"),
    free_over: str(form, "free_over") ? cents(form, "free_over") : null,
    min_subtotal: str(form, "min_subtotal") ? cents(form, "min_subtotal") : null,
    max_subtotal: str(form, "max_subtotal") ? cents(form, "max_subtotal") : null,
    delivery_min_days: Math.max(0, int(form, "delivery_min_days", 2)),
    delivery_max_days: Math.max(0, int(form, "delivery_max_days", 5)),
    sort_order: int(form, "sort_order"),
    active: bool(form, "active"),
  };
  const { error } = id
    ? await db.from("shipping_rates").update(payload).eq("id", id)
    : await db.from("shipping_rates").insert(payload);
  if (error) throw new Error(error.message);
  flush();
  redirect("/admin/shipping?saved=1");
}

export async function deleteShippingRate(form: FormData) {
  const db = await guard("shipping");
  const { error } = await db
    .from("shipping_rates")
    .delete()
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  flush();
  redirect("/admin/shipping");
}

/* -------------------------------------------------------------------------- */
/* Fulfilment and returns                                                     */
/* -------------------------------------------------------------------------- */

export async function saveFulfilment(form: FormData) {
  const db = await guard("orders");
  const id = str(form, "id");
  const tracking = nullable(form, "tracking_number");
  const markShipped = bool(form, "mark_shipped");

  const { error } = await db
    .from("orders")
    .update({
      carrier: nullable(form, "carrier"),
      tracking_number: tracking,
      tracking_url: nullable(form, "tracking_url"),
      internal_note: nullable(form, "internal_note"),
      ...(markShipped
        ? { shipped_at: new Date().toISOString(), status: "fulfilled" }
        : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${id}?saved=1`);
}

export async function updateReturn(form: FormData) {
  const db = await guard("returns");
  const { error } = await db
    .from("return_requests")
    .update({
      status: str(form, "status"),
      admin_note: nullable(form, "admin_note"),
    })
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/returns");
  redirect("/admin/returns");
}
