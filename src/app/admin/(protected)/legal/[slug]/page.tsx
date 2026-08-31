import { requireSection } from "@/lib/supabase/auth";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AdminHeading,
  Card,
  Checkbox,
  Field,
  Notice,
} from "@/components/admin/ui";
import { getLegalPage } from "@/lib/legal/queries";
import { parseLegalBody } from "@/lib/legal/render";
import { getSettings } from "@/lib/settings";
import type { LegalSlug } from "@/types/settings";
import { resetLegalPage, saveLegalPage } from "../../../actions";

const SLUGS: LegalSlug[] = [
  "imprint",
  "privacy",
  "terms",
  "returns",
  "shipping",
];

const TOKENS = [
  "legal_name",
  "street",
  "postal_code",
  "city",
  "country",
  "representative",
  "register_court",
  "register_number",
  "vat_id",
  "contact_email",
  "support_email",
  "phone",
  "free_shipping",
  "shipping_rate",
  "delivery_days",
  "countries",
];

export default async function AdminLegalEditor({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; reset?: string }>;
}) {
  await requireSection("legal");
  const { slug } = await params;
  const { saved, reset } = await searchParams;
  if (!SLUGS.includes(slug as LegalSlug)) notFound();

  const [page, settings] = await Promise.all([
    getLegalPage(slug as LegalSlug),
    getSettings(),
  ]);
  const preview = parseLegalBody(page.body, settings);

  return (
    <div className="grid gap-8">
      <AdminHeading
        title={page.title}
        subtitle={`Wird unter /${slug} ausgeliefert.`}
        action={
          <div className="flex gap-5">
            <Link
              href={`/${slug}`}
              className="os-label os-underline text-[0.625rem]"
            >
              Seite ansehen
            </Link>
            <Link
              href="/admin/legal"
              className="os-label os-underline text-[0.625rem]"
            >
              Zurück
            </Link>
          </div>
        }
      />

      {saved ? <Notice tone="success">Gespeichert.</Notice> : null}
      {reset ? (
        <Notice tone="success">Auf die Vorlage zurückgesetzt.</Notice>
      ) : null}

      <Card title="Inhalt">
        <form action={saveLegalPage} className="grid gap-5">
          <input type="hidden" name="slug" value={slug} />
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Titel" name="title" required defaultValue={page.title} />
            <Field label="Einleitung" name="intro" defaultValue={page.intro} />
          </div>

          <div>
            <label htmlFor="field-body" className="os-eyebrow block">
              Text
            </label>
            <textarea
              id="field-body"
              name="body"
              rows={26}
              defaultValue={page.body}
              spellCheck
              className="os-input resize-y font-mono text-[0.75rem] leading-relaxed"
            />
          </div>

          <Checkbox
            label="Als Entwurf markieren (Warnhinweis im Shop, kein Index)"
            name="draft"
            defaultChecked={page.draft}
          />

          <button type="submit" className="os-btn os-btn-signal justify-self-start">
            Speichern
          </button>
        </form>
      </Card>

      <Card title="Formatierung">
        <div className="grid gap-4 text-xs leading-relaxed text-smoke">
          <p>
            Eine Zeile, die mit <code className="text-bone">## </code> beginnt,
            startet einen neuen Abschnitt. Leerzeilen trennen Absätze.
          </p>
          <div>
            <p className="mb-2">
              Platzhalter werden beim Ausliefern durch die Firmendaten ersetzt:
            </p>
            <ul className="flex flex-wrap gap-2">
              {TOKENS.map((token) => (
                <li
                  key={token}
                  className="border os-rule px-2 py-1 font-mono text-[0.625rem] text-bone"
                >
                  {`{{${token}}}`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card title="Vorschau">
        {preview.length === 0 ? (
          <p className="text-xs text-smoke">Noch kein Inhalt.</p>
        ) : (
          <div className="grid gap-6">
            {preview.map((section) => (
              <div key={section.heading}>
                <p className="os-label text-[0.6875rem]">{section.heading}</p>
                {section.paragraphs.map((paragraph, index) => (
                  <p
                    key={`${section.heading}-${index}`}
                    className="mt-2 max-w-[68ch] text-[0.8125rem] leading-relaxed whitespace-pre-line text-smoke"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Zurücksetzen">
        <form action={resetLegalPage} className="flex flex-wrap items-center gap-6">
          <input type="hidden" name="slug" value={slug} />
          <p className="text-xs text-smoke">
            Löscht deine Fassung und stellt die mitgelieferte Vorlage wieder her.
          </p>
          <button
            type="submit"
            className="os-label border border-signal px-4 py-3 text-[0.625rem] text-signal transition-colors hover:bg-signal hover:text-paper"
          >
            Auf Vorlage zurücksetzen
          </button>
        </form>
      </Card>
    </div>
  );
}
