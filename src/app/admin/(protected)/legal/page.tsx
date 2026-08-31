import { requireSection } from "@/lib/supabase/auth";
import Link from "next/link";

import { AdminHeading, Notice } from "@/components/admin/ui";
import { getLegalPage } from "@/lib/legal/queries";
import type { LegalSlug } from "@/types/settings";

const PAGES: { slug: LegalSlug; label: string; note: string }[] = [
  { slug: "imprint", label: "Impressum", note: "Pflichtangaben nach § 5 DDG" },
  { slug: "privacy", label: "Datenschutz", note: "Verarbeitung, Rechte, Dienste" },
  { slug: "terms", label: "AGB", note: "Vertragsschluss, Preise, Lieferung" },
  { slug: "returns", label: "Widerruf & Retouren", note: "Widerrufsbelehrung, Muster" },
  { slug: "shipping", label: "Versand", note: "Kosten, Laufzeit, Länder" },
];

export default async function AdminLegalPage() {
  await requireSection("legal");
  const pages = await Promise.all(
    PAGES.map(async (entry) => ({
      ...entry,
      record: await getLegalPage(entry.slug),
    })),
  );

  return (
    <div className="grid gap-8">
      <AdminHeading
        title="Legal"
        subtitle="Rechtstexte bearbeiten. Firmendaten werden über Platzhalter automatisch eingesetzt."
      />

      <Notice>
        Solange eine Seite als <em>Entwurf</em> markiert ist, zeigt sie im Shop
        einen sichtbaren Warnhinweis und wird nicht von Suchmaschinen indexiert.
        Nimm den Haken erst raus, wenn der Text juristisch geprüft ist.
      </Notice>

      <ul className="grid gap-px bg-bone/10">
        {pages.map((page) => (
          <li key={page.slug} className="bg-void">
            <Link
              href={`/admin/legal/${page.slug}`}
              className="group grid gap-3 py-6 md:grid-cols-12 md:items-center"
            >
              <div className="md:col-span-4">
                <p className="os-display text-2xl transition-colors group-hover:text-signal">
                  {page.label}
                </p>
                <p className="mt-1 text-[0.625rem] text-smoke">/{page.slug}</p>
              </div>
              <p className="text-xs text-smoke md:col-span-5">{page.note}</p>
              <p className="os-label text-[0.625rem] md:col-span-2">
                {page.record.draft ? (
                  <span className="text-signal">Entwurf</span>
                ) : (
                  <span className="text-smoke">Veröffentlicht</span>
                )}
              </p>
              <span
                aria-hidden="true"
                className="text-smoke transition-transform group-hover:translate-x-1 md:col-span-1 md:text-right"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
