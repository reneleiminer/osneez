/**
 * Public tracking URLs per carrier. These are stable consumer endpoints — no
 * contract and no API key needed, so this part works today.
 */
const TEMPLATES: Record<string, string> = {
  DHL: "https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode={code}",
  DPD: "https://tracking.dpd.de/status/de_DE/parcel/{code}",
  GLS: "https://gls-group.eu/DE/de/paketverfolgung?match={code}",
  HERMES:
    "https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation/#{code}",
  UPS: "https://www.ups.com/track?loc=de_DE&tracknum={code}",
  "DEUTSCHE POST":
    "https://www.deutschepost.de/sendung/simpleQueryResult.html?form.sendungsnummer={code}",
  FEDEX: "https://www.fedex.com/fedextrack/?trknbr={code}",
};

export const KNOWN_CARRIERS = [
  "DHL",
  "DPD",
  "GLS",
  "Hermes",
  "UPS",
  "Deutsche Post",
  "FedEx",
];

/** Builds a tracking link, or null when the carrier is unknown. */
export function trackingUrlFor(
  carrier: string | null,
  trackingNumber: string | null,
): string | null {
  if (!carrier || !trackingNumber) return null;
  const template = TEMPLATES[carrier.trim().toUpperCase()];
  if (!template) return null;
  return template.replace("{code}", encodeURIComponent(trackingNumber.trim()));
}
