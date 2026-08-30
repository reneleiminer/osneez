import type { Metadata } from "next";

import { LegalPage } from "@/components/ui/legal-page";
import { SHIPPING_COUNTRIES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping",
  description:
    "Versandkosten, Lieferzeiten und Versandländer für Bestellungen bei OSNEEZ.",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <LegalPage
      eyebrow="Service"
      title="Shipping"
      intro="Versand innerhalb von 48 Stunden (Mo–Fr). Kostenlos in Deutschland ab 120 €."
      sections={[
        {
          heading: "Kosten",
          body: [
            "Deutschland: 4,90 € — ab einem Bestellwert von 120 € versandkostenfrei.",
            "EU: Der Versandpreis wird im Checkout anhand des Ziellandes berechnet und vor dem Bezahlen angezeigt.",
          ],
        },
        {
          heading: "Laufzeit",
          body: [
            "Bearbeitung: 1–2 Werktage. Zustellung: 2–5 Werktage innerhalb der EU.",
            "Bei Drops kann die Bearbeitung in den ersten Tagen nach Release länger dauern. Wir melden uns, wenn etwas abweicht.",
          ],
        },
        {
          heading: "Versandländer",
          body: [
            `Aktuell versenden wir nach: ${SHIPPING_COUNTRIES.join(", ")}.`,
            "Weitere Länder auf Anfrage — schreib uns über die Kontaktseite.",
          ],
        },
        {
          heading: "Sendungsverfolgung",
          body: [
            "Sobald dein Paket das Lager verlässt, bekommst du eine E-Mail mit Tracking-Link.",
          ],
        },
        {
          heading: "Zoll und Einfuhr",
          body: [
            "Bei Lieferungen außerhalb der EU können Zölle und Einfuhrsteuern anfallen, die von der Empfängerin oder dem Empfänger zu tragen sind.",
          ],
        },
      ]}
      showPlaceholderNotice={false}
    />
  );
}
