import type { Metadata } from "next";

import { LegalPage } from "@/components/ui/legal-page";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen des OSNEEZ Onlineshops.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="AGB"
      intro="Allgemeine Geschäftsbedingungen für Bestellungen über diesen Shop. Entwurf — vor dem Launch anwaltlich prüfen lassen."
      sections={[
        {
          heading: "1. Geltungsbereich",
          body: [
            "Diese Bedingungen gelten für alle Bestellungen von Verbraucherinnen und Verbrauchern sowie Unternehmen über den OSNEEZ Onlineshop, betrieben von [Firmenname], [Anschrift].",
          ],
        },
        {
          heading: "2. Vertragsschluss",
          body: [
            "Die Darstellung der Produkte im Shop ist kein bindendes Angebot. Mit dem Abschluss des Bestellvorgangs gibst du ein verbindliches Angebot ab. Der Vertrag kommt mit unserer Auftragsbestätigung oder mit dem Versand der Ware zustande.",
          ],
        },
        {
          heading: "3. Preise und Versandkosten",
          body: [
            "Alle Preise verstehen sich inklusive gesetzlicher Umsatzsteuer. Versandkosten werden im Checkout ausgewiesen. Ab einem Bestellwert von 120 € liefern wir innerhalb Deutschlands versandkostenfrei.",
          ],
        },
        {
          heading: "4. Zahlung",
          body: [
            "Die Zahlungsabwicklung erfolgt über Stripe. Verfügbare Zahlungsarten werden im Checkout angezeigt. Die Belastung erfolgt mit Abschluss der Bestellung.",
          ],
        },
        {
          heading: "5. Lieferung",
          body: [
            "Wir versenden in die im Checkout aufgeführten Länder. Die Lieferzeit beträgt in der Regel 2–5 Werktage nach Zahlungseingang. Bei Limited Runs kann sich die Bearbeitung verlängern; wir informieren dich in diesem Fall per E-Mail.",
          ],
        },
        {
          heading: "6. Widerrufsrecht",
          body: [
            "Verbraucherinnen und Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Einzelheiten und das Muster-Widerrufsformular findest du auf der Seite Returns.",
          ],
        },
        {
          heading: "7. Gewährleistung",
          body: [
            "Es gelten die gesetzlichen Mängelhaftungsrechte.",
          ],
        },
        {
          heading: "8. Streitbeilegung",
          body: [
            "Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
          ],
        },
        {
          heading: "9. Anwendbares Recht",
          body: [
            "Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Zwingende Verbraucherschutzvorschriften des Landes deines gewöhnlichen Aufenthalts bleiben unberührt.",
          ],
        },
      ]}
    />
  );
}
