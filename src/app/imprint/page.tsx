import type { Metadata } from "next";

import { LegalPage } from "@/components/ui/legal-page";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung nach § 5 DDG.",
  alternates: { canonical: "/imprint" },
  robots: { index: false, follow: true },
};

export default function ImprintPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Impressum"
      intro="Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)."
      sections={[
        {
          heading: "Anbieter",
          body: [
            "[Rechtsform und Firmenname]",
            "[Straße und Hausnummer]",
            "[PLZ und Ort]",
            "[Land]",
          ],
        },
        {
          heading: "Vertreten durch",
          body: ["[Vor- und Nachname der vertretungsberechtigten Person]"],
        },
        {
          heading: "Kontakt",
          body: [
            "Telefon: [Telefonnummer]",
            "E-Mail: [E-Mail-Adresse]",
          ],
        },
        {
          heading: "Registereintrag",
          body: [
            "[Registergericht]",
            "[Registernummer]",
            "Falls keine Eintragung besteht, diesen Abschnitt entfernen.",
          ],
        },
        {
          heading: "Umsatzsteuer-ID",
          body: [
            "Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: [USt-IdNr.]",
            "Falls die Kleinunternehmerregelung nach § 19 UStG angewendet wird, ist stattdessen der entsprechende Hinweis aufzunehmen.",
          ],
        },
        {
          heading: "Redaktionell verantwortlich",
          body: ["[Vor- und Nachname]", "[Anschrift]"],
        },
        {
          heading: "EU-Streitschlichtung",
          body: [
            "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit. Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
          ],
        },
      ]}
    />
  );
}
