import { requireSection } from "@/lib/supabase/auth";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AdminHeading,
  Card,
  Checkbox,
  Field,
  Notice,
  Select,
  TextArea,
} from "@/components/admin/ui";
import { ProductVisual } from "@/components/ui/product-visual";
import { getProduct, listCollections, listDrops } from "@/lib/admin/data";
import { CATEGORIES } from "@/lib/site";
import {
  deleteProduct,
  deleteProductImage,
  deleteVariant,
  saveProduct,
  saveVariant,
  uploadProductImage,
} from "../../../actions";

const STATUS = ["active", "coming_soon", "sold_out", "archived"];
const BADGES = ["", "NEW", "LIMITED", "RESTOCK", "SOLD OUT", "UPCOMING"];
const IMAGE_TYPES = ["front", "back", "detail", "lifestyle"];

/** Cents → the euro string the price inputs expect. */
function euros(value: number | null): string {
  return value === null ? "" : (value / 100).toFixed(2);
}

export default async function AdminProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireSection("products");
  const { id } = await params;
  const { saved, error } = await searchParams;
  const isNew = id === "new";

  const product = isNew ? null : await getProduct(id);
  if (!isNew && !product) notFound();

  const [collections, drops] = await Promise.all([
    listCollections(),
    listDrops(),
  ]);

  return (
    <div className="grid gap-8">
      <AdminHeading
        title={product ? product.name : "Neues Produkt"}
        subtitle={
          product
            ? `/shop/${product.slug}`
            : "Grunddaten speichern — Größen und Bilder kommen danach."
        }
        action={
          <Link href="/admin/products" className="os-label os-underline text-[0.625rem]">
            Zurück zur Liste
          </Link>
        }
      />

      {saved ? <Notice tone="success">Gespeichert.</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      <Card title="Grunddaten">
        <form action={saveProduct} className="grid gap-6">
          {product ? <input type="hidden" name="id" value={product.id} /> : null}

          <div className="grid gap-6 md:grid-cols-2">
            <Field
              label="Name"
              name="name"
              required
              defaultValue={product?.name}
              placeholder="Pit Hoodie"
            />
            <Field
              label="Slug"
              name="slug"
              defaultValue={product?.slug}
              hint="Leer lassen = automatisch aus dem Namen"
            />
            <Field
              label="Untertitel"
              name="subtitle"
              defaultValue={product?.subtitle}
              placeholder="Deep Black"
            />
            <Select
              label="Kategorie"
              name="category"
              defaultValue={product?.category ?? "tees"}
              options={CATEGORIES.map((entry) => ({
                value: entry.slug,
                label: entry.label,
              }))}
            />
            <Field
              label="Preis (€)"
              name="price"
              type="text"
              required
              step="0.01"
              defaultValue={product ? euros(product.price) : ""}
              placeholder="130.00"
            />
            <Field
              label="Streichpreis (€)"
              name="compare_at_price"
              type="text"
              defaultValue={product ? euros(product.compare_at_price) : ""}
              hint="Leer lassen, wenn es keinen gibt"
            />
            <Select
              label="Status"
              name="status"
              defaultValue={product?.status ?? "active"}
              options={STATUS.map((value) => ({ value, label: value }))}
            />
            <Select
              label="Badge"
              name="badge"
              defaultValue={product?.badge ?? ""}
              options={BADGES.map((value) => ({
                value,
                label: value || "— kein Badge —",
              }))}
            />
            <Select
              label="Collection"
              name="collection_id"
              defaultValue={product?.collection_id ?? ""}
              options={[
                { value: "", label: "— keine —" },
                ...collections.map((entry) => ({
                  value: entry.id,
                  label: entry.name,
                })),
              ]}
            />
            <Select
              label="Drop"
              name="drop_id"
              defaultValue={product?.drop_id ?? ""}
              options={[
                { value: "", label: "— keiner —" },
                ...drops.map((entry) => ({ value: entry.id, label: entry.name })),
              ]}
            />
          </div>

          <TextArea
            label="Beschreibung"
            name="description"
            defaultValue={product?.description}
          />
          <div className="grid gap-6 md:grid-cols-3">
            <TextArea label="Material" name="material" rows={3} defaultValue={product?.material} />
            <TextArea label="Fit" name="fit" rows={3} defaultValue={product?.fit} />
            <TextArea label="Details" name="details" rows={3} defaultValue={product?.details} />
          </div>

          <div className="flex flex-wrap gap-8">
            <Checkbox
              label="Sichtbar im Shop"
              name="active"
              defaultChecked={product?.active ?? true}
            />
            <Checkbox
              label="Auf der Startseite zeigen"
              name="featured"
              defaultChecked={product?.featured ?? false}
            />
          </div>

          <button type="submit" className="os-btn os-btn-signal justify-self-start">
            Speichern
          </button>
        </form>
      </Card>

      {product ? (
        <>
          <Card title="Größen und Bestand">
            {product.variants.length === 0 ? (
              <p className="mb-6 text-xs text-smoke">
                Noch keine Varianten. Ohne mindestens eine Variante mit Bestand
                ist das Produkt nicht kaufbar.
              </p>
            ) : (
              <div className="mb-8 overflow-x-auto">
                <table className="w-full min-w-max text-left text-xs">
                  <thead>
                    <tr className="border-b os-rule">
                      {["Größe", "Farbe", "SKU", "Bestand", "Aktiv", ""].map((head) => (
                        <th
                          key={head}
                          scope="col"
                          className="os-label px-3 py-2 text-[0.5625rem] text-smoke"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant) => (
                      <tr key={variant.id} className="border-b border-bone/5">
                        <td className="px-3 py-3">
                          <form action={saveVariant} className="flex items-center gap-3">
                            <input type="hidden" name="id" value={variant.id} />
                            <input type="hidden" name="product_id" value={product.id} />
                            <input type="hidden" name="product_slug" value={product.slug} />
                            <input type="hidden" name="size" value={variant.size} />
                            <input type="hidden" name="color" value={variant.color} />
                            <input type="hidden" name="sku" value={variant.sku} />
                            <span className="os-label text-[0.6875rem]">
                              {variant.size}
                            </span>
                            <input
                              type="number"
                              name="stock"
                              min={0}
                              defaultValue={variant.stock}
                              aria-label={`Bestand ${variant.size}`}
                              className="w-20 border os-rule bg-transparent px-2 py-1 text-xs"
                            />
                            <label className="os-label flex items-center gap-2 text-[0.5625rem] text-smoke">
                              <input
                                type="checkbox"
                                name="active"
                                defaultChecked={variant.active}
                                className="size-3.5 accent-signal"
                              />
                              aktiv
                            </label>
                            <button
                              type="submit"
                              className="os-label text-[0.5625rem] text-smoke underline hover:text-bone"
                            >
                              Update
                            </button>
                          </form>
                        </td>
                        <td className="px-3 py-3 text-smoke">{variant.color}</td>
                        <td className="px-3 py-3 text-smoke">{variant.sku}</td>
                        <td className="px-3 py-3 tabular-nums">{variant.stock}</td>
                        <td className="px-3 py-3 text-smoke">
                          {variant.active ? "ja" : "nein"}
                        </td>
                        <td className="px-3 py-3">
                          <form action={deleteVariant}>
                            <input type="hidden" name="id" value={variant.id} />
                            <input type="hidden" name="product_id" value={product.id} />
                            <button
                              type="submit"
                              className="os-label text-[0.5625rem] text-smoke hover:text-signal"
                            >
                              Löschen
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <form action={saveVariant} className="grid gap-4 border-t os-rule pt-6 md:grid-cols-4">
              <input type="hidden" name="product_id" value={product.id} />
              <input type="hidden" name="product_slug" value={product.slug} />
              <Field label="Größe" name="size" required placeholder="M" />
              <Field
                label="Farbe"
                name="color"
                required
                defaultValue={product.variants[0]?.color ?? product.subtitle ?? ""}
              />
              <Field label="Bestand" name="stock" type="number" defaultValue={0} />
              <div className="flex items-end gap-4">
                <Checkbox label="aktiv" name="active" defaultChecked />
                <button type="submit" className="os-btn os-btn-ghost">
                  Hinzufügen
                </button>
              </div>
            </form>
          </Card>

          <Card title="Bilder">
            {product.images.length === 0 ? (
              <p className="mb-6 text-xs text-smoke">
                Noch keine Bilder — der Shop zeigt so lange die generierten
                Platzhalter-Frames.
              </p>
            ) : (
              <ul className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {product.images.map((image) => (
                  <li key={image.id}>
                    <ProductVisual
                      seed={product.slug}
                      src={image.image_url}
                      alt={image.alt}
                      frame={image.type}
                      sizes="200px"
                      className="aspect-4/5 w-full"
                    />
                    <p className="os-label mt-2 text-[0.5625rem] text-smoke">
                      {image.type} · #{image.sort_order}
                    </p>
                    <form action={deleteProductImage}>
                      <input type="hidden" name="id" value={image.id} />
                      <input type="hidden" name="product_id" value={product.id} />
                      <input type="hidden" name="image_url" value={image.image_url} />
                      <button
                        type="submit"
                        className="os-label mt-1 text-[0.5625rem] text-smoke hover:text-signal"
                      >
                        Löschen
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            <form
              action={uploadProductImage}
              className="grid gap-4 border-t os-rule pt-6 md:grid-cols-4"
            >
              <input type="hidden" name="product_id" value={product.id} />
              <input type="hidden" name="product_slug" value={product.slug} />
              <div>
                <label htmlFor="file" className="os-eyebrow block">
                  Datei
                </label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept="image/*"
                  required
                  className="os-input file:mr-3 file:border-0 file:bg-bone file:px-3 file:py-1 file:text-xs file:text-void"
                />
              </div>
              <Select
                label="Ansicht"
                name="type"
                options={IMAGE_TYPES.map((value) => ({ value, label: value }))}
              />
              <Field label="Alt-Text" name="alt" placeholder="Pit Hoodie von vorn" />
              <div className="flex items-end gap-4">
                <Field label="Reihenfolge" name="sort_order" type="number" defaultValue={0} />
                <button type="submit" className="os-btn os-btn-ghost">
                  Upload
                </button>
              </div>
            </form>
            <p className="mt-4 text-[0.625rem] text-smoke">
              Max. 8 MB pro Bild. Landet im Storage-Bucket
              <code className="text-bone"> products</code>.
            </p>
          </Card>

          <Card title="Gefahrenzone">
            <form action={deleteProduct} className="flex flex-wrap items-center gap-6">
              <input type="hidden" name="id" value={product.id} />
              <p className="text-xs text-smoke">
                Löscht das Produkt samt Varianten und Bild-Einträgen. Nicht
                umkehrbar.
              </p>
              <button
                type="submit"
                className="os-label border border-signal px-4 py-3 text-[0.625rem] text-signal transition-colors hover:bg-signal hover:text-paper"
              >
                Produkt löschen
              </button>
            </form>
          </Card>
        </>
      ) : null}
    </div>
  );
}
