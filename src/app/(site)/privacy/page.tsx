import type { Metadata } from "next";

import { LegalPage } from "@/components/ui/legal-page";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Informationen zur Verarbeitung personenbezogener Daten.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Datenschutz"
      intro="Diese Erklärung beschreibt, welche Daten beim Besuch dieses Shops verarbeitet werden. Sie ist ein Entwurf und muss vor dem Launch geprüft und vervollständigt werden."
      sections={[
        {
          heading: "Verantwortlicher",
          body: [
            "[Firmenname], [Anschrift], [E-Mail-Adresse]. Eine Datenschutzbeauftragte oder ein Datenschutzbeauftragter ist [benannt / nicht benannt].",
          ],
        },
        {
          heading: "Hosting",
          body: [
            "Diese Website wird bei Vercel Inc. gehostet. Beim Aufruf werden technisch notwendige Server-Logdaten verarbeitet (IP-Adresse, Zeitpunkt, aufgerufene Ressource, User-Agent). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.",
          ],
        },
        {
          heading: "Bestellungen und Zahlungen",
          body: [
            "Für Bestellungen und Zahlungsabwicklung nutzen wir Stripe Payments Europe, Ltd. Dabei werden Bestell-, Kontakt- und Zahlungsdaten an Stripe übermittelt und dort verarbeitet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.",
            "Bestell- und Rechnungsdaten werden zur Erfüllung handels- und steuerrechtlicher Aufbewahrungspflichten gespeichert.",
          ],
        },
        {
          heading: "Newsletter",
          body: [
            "Wenn du dich für den Newsletter einträgst, speichern wir deine E-Mail-Adresse, den Zeitpunkt und die Quelle der Anmeldung. Rechtsgrundlage ist deine Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. Du kannst die Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.",
          ],
        },
        {
          heading: "Datenbank und Speicherung",
          body: [
            "Produktdaten, Newsletter-Anmeldungen und Bestellreferenzen werden in einer Supabase-Instanz (Supabase Inc.) gespeichert. Die Serverregion ist [Region eintragen].",
          ],
        },
        {
          heading: "Lokale Speicherung im Browser",
          body: [
            "Dein Warenkorb wird ausschließlich lokal in deinem Browser (localStorage) gespeichert, damit er nach einem Reload erhalten bleibt. Diese Daten werden nicht an uns übertragen.",
          ],
        },
        {
          heading: "Deine Rechte",
          body: [
            "Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie ein Beschwerderecht bei einer Aufsichtsbehörde.",
            "Anfragen richtest du an [E-Mail-Adresse].",
          ],
        },
      ]}
    />
  );
}
