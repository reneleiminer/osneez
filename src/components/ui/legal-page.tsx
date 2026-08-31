import type { RenderedSection } from "@/lib/legal/render";

/**
 * Shell for the legal and service pages. Content comes from the database
 * (or the bundled draft); a page still flagged as a draft says so in the UI
 * and is excluded from search engines.
 */
export function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
  draft = false,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  sections: RenderedSection[];
  draft?: boolean;
}) {
  return (
    <div className="os-edge py-14 lg:py-20">
      <header className="border-b os-rule pb-8">
        <p className="os-eyebrow text-signal">{eyebrow}</p>
        <h1 className="os-display mt-4 text-[clamp(2.5rem,9vw,6rem)] leading-[0.82]">
          {title}
        </h1>
        {intro ? (
          <p className="mt-6 max-w-[60ch] text-sm leading-relaxed text-smoke">
            {intro}
          </p>
        ) : null}
      </header>

      {draft ? (
        <div className="mt-8 border-l-2 border-signal bg-asphalt/60 px-5 py-4">
          <p className="os-label text-[0.5625rem] text-signal">
            Entwurf — juristisch prüfen
          </p>
          <p className="mt-2 max-w-[68ch] text-[0.75rem] leading-relaxed text-smoke">
            Angaben in eckigen Klammern sind noch nicht hinterlegt. Dieser Text
            ist keine Rechtsberatung und ersetzt keine anwaltliche Prüfung.
          </p>
        </div>
      ) : null}

      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <nav aria-label="Inhalt" className="lg:col-span-3">
          <p className="os-eyebrow mb-4">Contents</p>
          <ol className="grid gap-2">
            {sections.map((section, index) => (
              <li key={section.heading}>
                <a
                  href={`#section-${index + 1}`}
                  className="os-underline text-xs text-bone/75 transition-colors hover:text-bone"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="lg:col-span-8 lg:col-start-5">
          {sections.map((section, index) => (
            <section
              key={section.heading}
              id={`section-${index + 1}`}
              className="scroll-mt-28 border-t os-rule py-8 first:border-t-0 first:pt-0"
            >
              <h2 className="os-label text-[0.6875rem]">{section.heading}</h2>
              <div className="mt-4 grid gap-4">
                {section.paragraphs.map((paragraph, position) => (
                  <p
                    key={`${section.heading}-${position}`}
                    className="max-w-[68ch] text-[0.8125rem] leading-relaxed whitespace-pre-line text-smoke"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
