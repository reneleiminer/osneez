"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAuthClient, requireAdmin } from "@/lib/supabase/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";

/**
 * Every mutation goes through here: the session is verified first, and only
 * then is the service-role client handed out. The service role bypasses RLS,
 * so this guard is the only thing standing between a request and the data.
 */
async function guard() {
  await requireAdmin();
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
  const db = await guard();
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
  const db = await guard();
  const { error } = await db
    .from("products")
    .delete()
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  flush();
  redirect("/admin/products");
}

export async function saveVariant(form: FormData) {
  const db = await guard();
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
  const db = await guard();
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
  const db = await guard();
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
  const db = await guard();
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
  const db = await guard();
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
  const db = await guard();
  const { error } = await db
    .from("collections")
    .delete()
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  flush();
  redirect("/admin/collections");
}

export async function saveDrop(form: FormData) {
  const db = await guard();
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
  const db = await guard();
  const { error } = await db.from("drops").delete().eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  flush();
  redirect("/admin/drops");
}

export async function saveWorldStory(form: FormData) {
  const db = await guard();
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
  const db = await guard();
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
  const db = await guard();
  const { error } = await db
    .from("orders")
    .update({ status: str(form, "status") })
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

export async function toggleSubscriber(form: FormData) {
  const db = await guard();
  const { error } = await db
    .from("newsletter_subscribers")
    .update({ active: str(form, "active") === "true" })
    .eq("id", str(form, "id"));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter");
}
