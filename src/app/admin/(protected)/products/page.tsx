import Link from "next/link";

import { AdminHeading, Empty } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { listProducts } from "@/lib/admin/data";
import { formatPrice } from "@/lib/format";
import { categoryLabel, totalStock } from "@/lib/shop/product";

export default async function AdminProductsPage() {
  const products = await listProducts();

  return (
    <div className="grid gap-8">
      <AdminHeading
        title="Products"
        subtitle="Alles im Katalog — auch was gerade nicht sichtbar ist."
        action={
          <Link href="/admin/products/new" className="os-btn os-btn-signal">
            Neues Produkt
          </Link>
        }
      />

      {products.length === 0 ? (
        <Empty>
          Noch keine Produkte in der Datenbank. Entweder legst du eins an, oder
          du spielst die Migration 0002 ein, die den Demo-Katalog einträgt.
        </Empty>
      ) : (
        <div className="overflow-x-auto border os-rule">
          <table className="w-full min-w-max text-left text-xs">
            <thead>
              <tr className="border-b os-rule bg-asphalt/40">
                {["Produkt", "Kategorie", "Preis", "Bestand", "Status", "Sichtbar", ""].map(
                  (head) => (
                    <th
                      key={head}
                      scope="col"
                      className="os-label px-4 py-3 text-[0.5625rem] font-semibold text-smoke"
                    >
                      {head}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = totalStock(product);
                return (
                  <tr key={product.id} className="border-b border-bone/5">
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="os-label os-underline text-[0.6875rem]"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-[0.625rem] text-smoke">
                        /{product.slug}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-smoke">
                      {categoryLabel(product.category)}
                    </td>
                    <td className="px-4 py-4 tabular-nums">
                      {formatPrice(product.price)}
                    </td>
                    <td
                      className={`px-4 py-4 tabular-nums ${stock <= 3 ? "text-signal" : "text-smoke"}`}
                    >
                      {stock}
                      <span className="text-smoke">
                        {" "}
                        ({product.variants.length})
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge value={product.badge} />
                      <span className="os-label ml-2 text-[0.5625rem] text-smoke">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-smoke">
                      {product.active ? "Ja" : "Nein"}
                      {product.featured ? " · Featured" : ""}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/shop/${product.slug}`}
                        className="os-label os-underline text-[0.5625rem] text-smoke"
                      >
                        Ansehen
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
