import Link from "next/link";

import { AdminHeading, Card, Notice } from "@/components/admin/ui";
import { dashboardCounts, isWritable } from "@/lib/admin/data";
import { formatPrice } from "@/lib/format";

export default async function AdminOverviewPage() {
  if (!isWritable()) {
    return (
      <div className="grid gap-8">
        <AdminHeading title="Overview" />
        <Notice tone="error">
          <code className="text-bone">SUPABASE_SERVICE_ROLE_KEY</code> fehlt.
          Ohne diesen Key kann das Admin weder lesen noch schreiben. Trag ihn in
          Vercel unter Settings → Environment Variables ein und deploye neu.
        </Notice>
      </div>
    );
  }

  const counts = await dashboardCounts();

  const tiles = [
    { label: "Produkte", value: String(counts.products), href: "/admin/products" },
    { label: "Bestellungen", value: String(counts.orders), href: "/admin/orders" },
    { label: "Umsatz (bezahlt)", value: formatPrice(counts.revenue), href: "/admin/orders" },
    { label: "Newsletter", value: String(counts.subscribers), href: "/admin/newsletter" },
  ] as const;

  return (
    <div className="grid gap-10">
      <AdminHeading
        title="Overview"
        subtitle="Alles, was der Shop gerade zeigt und verkauft."
      />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <li key={tile.label}>
            <Link
              href={tile.href}
              className="group block border os-rule bg-asphalt/40 p-5 transition-colors hover:border-bone/30"
            >
              <p className="os-eyebrow">{tile.label}</p>
              <p className="os-display mt-3 text-4xl transition-colors group-hover:text-signal">
                {tile.value}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {counts.lowStock > 0 ? (
        <Notice>
          {counts.lowStock} {counts.lowStock === 1 ? "Variante hat" : "Varianten haben"}{" "}
          nur noch 3 Stück oder weniger auf Lager.{" "}
          <Link href="/admin/products" className="os-underline text-bone">
            Bestände prüfen
          </Link>
        </Notice>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <Card title="Schnellstart">
          <ul className="grid gap-3 text-xs leading-relaxed text-smoke">
            <li>
              <Link href="/admin/products/new" className="os-underline text-bone">
                Neues Produkt anlegen
              </Link>{" "}
              — Grunddaten speichern, danach Größen und Bilder ergänzen.
            </li>
            <li>
              <Link href="/admin/drops" className="os-underline text-bone">
                Drop planen
              </Link>{" "}
              — mit Release-Datum in der Zukunft erscheint er als &bdquo;Upcoming&ldquo;.
            </li>
            <li>
              <Link href="/admin/orders" className="os-underline text-bone">
                Bestellungen
              </Link>{" "}
              — landen automatisch hier, sobald der Stripe-Webhook eingerichtet ist.
            </li>
          </ul>
        </Card>

        <Card title="Gut zu wissen">
          <ul className="grid gap-3 text-xs leading-relaxed text-smoke">
            <li>
              Preise werden in Euro eingegeben und als Cent gespeichert — 130,00
              ergibt 13000.
            </li>
            <li>
              Ein Produkt ist erst kaufbar, wenn Status <em>active</em> ist,
              &bdquo;Sichtbar&ldquo; gesetzt ist und mindestens eine Variante
              Bestand hat.
            </li>
            <li>
              Nach jeder Änderung wird der Shop-Cache geleert; die Seite zeigt
              den neuen Stand sofort.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
