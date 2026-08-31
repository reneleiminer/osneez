import type { Metadata } from "next";

import { LegalPage } from "@/components/ui/legal-page";

export const metadata: Metadata = {
  title: "Returns & Widerruf",
  description:
    "Widerrufsbelehrung und Rückgabeprozess für Bestellungen bei OSNEEZ.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <LegalPage
      eyebrow="Service"
      title="Returns"
      intro="14 Tage Widerrufsrecht. Ungetragen, mit Etikett, in der Originalverpackung."
      sections={[
        {
          heading: "So gibst du zurück",
          body: [
            "1. Schreib uns innerhalb von 14 Tagen nach Erhalt an [E-Mail-Adresse] mit deiner Bestellnummer.",
            "2. Du bekommst eine Rücksendebestätigung mit der Retourenadresse.",
            "3. Pack die Ware ungetragen und mit Etikett ein und sende sie zurück.",
            "4. Nach Prüfung erstatten wir den Kaufpreis über das ursprüngliche Zahlungsmittel.",
          ],
        },
        {
          heading: "Widerrufsrecht",
          body: [
            "Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem du oder ein von dir benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen hast bzw. hat.",
            "Um dein Widerrufsrecht auszuüben, musst du uns ([Firmenname], [Anschrift], [E-Mail-Adresse]) mittels einer eindeutigen Erklärung über deinen Entschluss informieren. Zur Wahrung der Frist reicht die rechtzeitige Absendung der Mitteilung.",
          ],
        },
        {
          heading: "Folgen des Widerrufs",
          body: [
            "Wenn du diesen Vertrag widerrufst, erstatten wir dir alle Zahlungen einschließlich der Standard-Lieferkosten unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag, an dem die Mitteilung über deinen Widerruf bei uns eingegangen ist.",
            "Wir können die Rückzahlung verweigern, bis wir die Waren zurückerhalten haben oder du den Nachweis erbracht hast, dass du die Waren zurückgesandt hast.",
            "Die unmittelbaren Kosten der Rücksendung trägst [du / tragen wir] — vor dem Launch festlegen und hier eintragen.",
          ],
        },
        {
          heading: "Muster-Widerrufsformular",
          body: [
            "An [Firmenname], [Anschrift], [E-Mail-Adresse]: Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über den Kauf der folgenden Waren: [Artikel]. Bestellt am [Datum] / erhalten am [Datum]. Name: [Name]. Anschrift: [Anschrift]. Datum und Unterschrift (nur bei Mitteilung auf Papier).",
          ],
        },
        {
          heading: "Ausnahmen",
          body: [
            "Vom Widerruf ausgenommen sind individuell angefertigte Artikel sowie versiegelte Waren, die aus Hygienegründen nicht zur Rückgabe geeignet sind, wenn die Versiegelung entfernt wurde.",
          ],
        },
      ]}
    />
  );
}
