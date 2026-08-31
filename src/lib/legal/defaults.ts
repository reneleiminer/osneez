import type { LegalSlug } from "@/types/settings";

/**
 * Starting drafts for the legal pages. The admin can overwrite each of these;
 * until it does, these render with {{tokens}} resolved from the company
 * settings. Anything still unset shows as a visible placeholder rather than
 * quietly disappearing.
 *
 * Lines beginning with "## " start a new section.
 * These are working drafts, not legal advice.
 */
export const DEFAULT_LEGAL: Record<
  LegalSlug,
  { title: string; intro: string; body: string; draft: boolean }
> = {
  imprint: {
    title: "Impressum",
    intro: "Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG).",
    draft: true,
    body: `## Anbieter
{{legal_name}}
{{street}}
{{postal_code}} {{city}}
{{country}}

## Vertreten durch
{{representative}}

## Kontakt
E-Mail: {{contact_email}}
Telefon: {{phone}}

## Registereintrag
Registergericht: {{register_court}}
Registernummer: {{register_number}}
Besteht keine Eintragung, kann dieser Abschnitt entfernt werden.

## Umsatzsteuer
Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: {{vat_id}}
{{tax_note}}

## Redaktionell verantwortlich
{{responsible_person}}

## EU-Streitschlichtung
Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit. Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`,
  },

  privacy: {
    title: "Datenschutz",
    intro:
      "Diese Erklärung beschreibt, welche Daten beim Besuch dieses Shops verarbeitet werden.",
    draft: true,
    body: `## Verantwortlicher
{{legal_name}}, {{street}}, {{postal_code}} {{city}}. Kontakt: {{contact_email}}.

## Hosting
Diese Website wird bei Vercel Inc. gehostet. Beim Aufruf werden technisch notwendige Server-Logdaten verarbeitet (IP-Adresse, Zeitpunkt, aufgerufene Ressource, User-Agent). Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.

## Bestellungen und Zahlungen
Für Bestellungen und Zahlungsabwicklung nutzen wir Stripe Payments Europe, Ltd. Dabei werden Bestell-, Kontakt- und Zahlungsdaten an Stripe übermittelt und dort verarbeitet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
Bestell- und Rechnungsdaten werden zur Erfüllung handels- und steuerrechtlicher Aufbewahrungspflichten gespeichert.

## Newsletter
Wenn du dich für den Newsletter einträgst, speichern wir deine E-Mail-Adresse, den Zeitpunkt und die Quelle der Anmeldung. Rechtsgrundlage ist deine Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. Du kannst sie jederzeit mit Wirkung für die Zukunft widerrufen.

## Datenbank und Speicherung
Produktdaten, Newsletter-Anmeldungen und Bestellreferenzen werden in einer Supabase-Instanz (Supabase Inc.) gespeichert.

## Lokale Speicherung im Browser
Dein Warenkorb wird ausschließlich lokal in deinem Browser (localStorage) gespeichert, damit er nach einem Reload erhalten bleibt. Diese Daten werden nicht an uns übertragen.

## Deine Rechte
Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie ein Beschwerderecht bei einer Aufsichtsbehörde. Anfragen richtest du an {{contact_email}}.`,
  },

  terms: {
    title: "AGB",
    intro: "Allgemeine Geschäftsbedingungen für Bestellungen über diesen Shop.",
    draft: true,
    body: `## 1. Geltungsbereich
Diese Bedingungen gelten für alle Bestellungen über den OSNEEZ Onlineshop, betrieben von {{legal_name}}, {{street}}, {{postal_code}} {{city}}.

## 2. Vertragsschluss
Die Darstellung der Produkte im Shop ist kein bindendes Angebot. Mit dem Abschluss des Bestellvorgangs gibst du ein verbindliches Angebot ab. Der Vertrag kommt mit unserer Auftragsbestätigung oder mit dem Versand der Ware zustande.

## 3. Preise und Versandkosten
Alle Preise verstehen sich inklusive gesetzlicher Umsatzsteuer. Versandkosten werden im Checkout ausgewiesen. Ab einem Bestellwert von {{free_shipping}} liefern wir innerhalb Deutschlands versandkostenfrei.

## 4. Zahlung
Die Zahlungsabwicklung erfolgt über Stripe. Die verfügbaren Zahlungsarten werden im Checkout angezeigt. Die Belastung erfolgt mit Abschluss der Bestellung.

## 5. Lieferung
Wir versenden in die im Checkout aufgeführten Länder. Die Lieferzeit beträgt in der Regel {{delivery_days}} Werktage nach Zahlungseingang. Bei Limited Runs kann sich die Bearbeitung verlängern; wir informieren dich in diesem Fall per E-Mail.

## 6. Widerrufsrecht
Verbraucherinnen und Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Einzelheiten und das Muster-Widerrufsformular findest du auf der Seite Returns.

## 7. Gewährleistung
Es gelten die gesetzlichen Mängelhaftungsrechte.

## 8. Streitbeilegung
Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.

## 9. Anwendbares Recht
Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Zwingende Verbraucherschutzvorschriften des Landes deines gewöhnlichen Aufenthalts bleiben unberührt.`,
  },

  returns: {
    title: "Returns",
    intro:
      "14 Tage Widerrufsrecht. Ungetragen, mit Etikett, in der Originalverpackung.",
    draft: true,
    body: `## So gibst du zurück
1. Schreib uns innerhalb von 14 Tagen nach Erhalt an {{support_email}} mit deiner Bestellnummer.
2. Du bekommst eine Rücksendebestätigung mit der Retourenadresse.
3. Pack die Ware ungetragen und mit Etikett ein und sende sie zurück.
4. Nach Prüfung erstatten wir den Kaufpreis über das ursprüngliche Zahlungsmittel.

## Widerrufsrecht
Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem du oder ein von dir benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen hast bzw. hat.
Um dein Widerrufsrecht auszuüben, musst du uns ({{legal_name}}, {{street}}, {{postal_code}} {{city}}, {{contact_email}}) mittels einer eindeutigen Erklärung über deinen Entschluss informieren. Zur Wahrung der Frist reicht die rechtzeitige Absendung der Mitteilung.

## Folgen des Widerrufs
Wenn du diesen Vertrag widerrufst, erstatten wir dir alle Zahlungen einschließlich der Standard-Lieferkosten unverzüglich und spätestens binnen vierzehn Tagen ab Eingang deines Widerrufs.
Wir können die Rückzahlung verweigern, bis wir die Waren zurückerhalten haben oder du den Nachweis erbracht hast, dass du sie zurückgesandt hast.
Die unmittelbaren Kosten der Rücksendung trägst du.

## Muster-Widerrufsformular
An {{legal_name}}, {{street}}, {{postal_code}} {{city}}, {{contact_email}}: Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über den Kauf der folgenden Waren: [Artikel]. Bestellt am [Datum] / erhalten am [Datum]. Name: [Name]. Anschrift: [Anschrift]. Datum und Unterschrift (nur bei Mitteilung auf Papier).

## Ausnahmen
Vom Widerruf ausgenommen sind individuell angefertigte Artikel sowie versiegelte Waren, die aus Hygienegründen nicht zur Rückgabe geeignet sind, wenn die Versiegelung entfernt wurde.`,
  },

  shipping: {
    title: "Shipping",
    intro: "Versand innerhalb von 48 Stunden (Mo–Fr).",
    draft: false,
    body: `## Kosten
Deutschland: {{shipping_rate}} — ab einem Bestellwert von {{free_shipping}} versandkostenfrei.
EU: Der Versandpreis wird im Checkout anhand des Ziellandes berechnet und vor dem Bezahlen angezeigt.

## Laufzeit
Bearbeitung: 1–2 Werktage. Zustellung: {{delivery_days}} Werktage innerhalb der EU.
Bei Drops kann die Bearbeitung in den ersten Tagen nach Release länger dauern. Wir melden uns, wenn etwas abweicht.

## Versandländer
Aktuell versenden wir nach: {{countries}}.
Weitere Länder auf Anfrage — schreib uns über die Kontaktseite.

## Sendungsverfolgung
Sobald dein Paket das Lager verlässt, bekommst du eine E-Mail mit Tracking-Link.

## Zoll und Einfuhr
Bei Lieferungen außerhalb der EU können Zölle und Einfuhrsteuern anfallen, die von der Empfängerin oder dem Empfänger zu tragen sind.`,
  },
};
