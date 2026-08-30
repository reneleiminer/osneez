import type { Product } from "@/types/shop";

type Row = { title: string; body: string };

/**
 * Native <details> so the accordion works without JavaScript and stays
 * keyboard accessible by default.
 */
export function ProductAccordion({ product }: { product: Product }) {
  const rows: Row[] = [
    product.material ? { title: "Material", body: product.material } : null,
    product.fit ? { title: "Fit", body: product.fit } : null,
    product.details ? { title: "Details", body: product.details } : null,
    {
      title: "Shipping",
      body: "Versand innerhalb von 48 Stunden (Mo–Fr). DE 4,90 €, kostenlos ab 120 €. EU-Versand im Checkout wählbar, Laufzeit 2–5 Werktage.",
    },
    {
      title: "Returns",
      body: "14 Tage Widerrufsrecht ab Erhalt. Ungetragen, mit Etikett. Details auf der Seite Returns.",
    },
  ].filter(Boolean) as Row[];

  return (
    <div className="mt-12 border-t os-rule">
      {rows.map((row) => (
        <details key={row.title} className="os-accordion border-b os-rule">
          <summary className="flex items-center justify-between py-5">
            <span className="os-label text-[0.6875rem]">{row.title}</span>
            <span
              aria-hidden="true"
              className="os-accordion-sign text-lg leading-none text-smoke"
            >
              +
            </span>
          </summary>
          <p className="max-w-[52ch] pb-6 text-[0.8125rem] leading-relaxed text-smoke">
            {row.body}
          </p>
        </details>
      ))}
    </div>
  );
}
