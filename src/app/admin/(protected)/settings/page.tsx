import {
  AdminHeading,
  Card,
  Checkbox,
  Field,
  Notice,
  TextArea,
} from "@/components/admin/ui";
import { getSettings, isCompanyComplete } from "@/lib/settings";
import {
  saveCompanySettings,
  savePaymentSettings,
  saveShippingSettings,
  saveShopSettings,
} from "../../actions";

/** Stripe payment method types that make sense for a German/EU storefront. */
const PAYMENT_METHODS = [
  { value: "card", label: "Karte (Visa, Mastercard, Amex)" },
  { value: "paypal", label: "PayPal" },
  { value: "klarna", label: "Klarna" },
  { value: "link", label: "Link (Stripe One-Click)" },
  { value: "bancontact", label: "Bancontact (BE)" },
  { value: "ideal", label: "iDEAL (NL)" },
  { value: "eps", label: "EPS (AT)" },
  { value: "p24", label: "Przelewy24 (PL)" },
  { value: "revolut_pay", label: "Revolut Pay" },
];

const euros = (cents: number) => (cents / 100).toFixed(2);

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const settings = await getSettings();

  return (
    <div className="grid gap-8">
      <AdminHeading
        title="Settings"
        subtitle="Firmendaten, Versand und Zahlungen. Diese Angaben speisen Impressum, Footer, Kontaktseite und Checkout."
      />

      {saved ? <Notice tone="success">Gespeichert ({saved}).</Notice> : null}

      {!isCompanyComplete(settings) ? (
        <Notice tone="error">
          Die Firmendaten sind unvollständig. Solange Name, Anschrift und
          E-Mail fehlen, zeigen Impressum und Widerrufsbelehrung sichtbare
          Platzhalter in eckigen Klammern.
        </Notice>
      ) : null}

      <Card title="Unternehmen">
        <form action={saveCompanySettings} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="Firmenname"
              name="legal_name"
              defaultValue={settings.legal_name}
              placeholder="OSNEEZ"
            />
            <Field
              label="Rechtsform"
              name="legal_form"
              defaultValue={settings.legal_form}
              placeholder="Einzelunternehmen / GmbH / UG"
            />
            <Field
              label="Vertretungsberechtigt"
              name="representative"
              defaultValue={settings.representative}
              placeholder="Vor- und Nachname"
            />
            <Field label="Straße und Hausnummer" name="street" defaultValue={settings.street} />
            <Field label="PLZ" name="postal_code" defaultValue={settings.postal_code} />
            <Field label="Ort" name="city" defaultValue={settings.city} />
            <Field label="Land" name="country" defaultValue={settings.country} />
            <Field
              label="Registergericht"
              name="register_court"
              defaultValue={settings.register_court}
              hint="Leer lassen, wenn keine Eintragung besteht"
            />
            <Field
              label="Registernummer"
              name="register_number"
              defaultValue={settings.register_number}
            />
            <Field
              label="USt-IdNr."
              name="vat_id"
              defaultValue={settings.vat_id}
            />
            <Field
              label="Redaktionell verantwortlich"
              name="responsible_person"
              defaultValue={settings.responsible_person}
              hint="Leer = Vertretungsberechtigte Person"
            />
            <Field label="Telefon" name="phone" defaultValue={settings.phone} />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="Kontakt-E-Mail"
              name="contact_email"
              type="email"
              defaultValue={settings.contact_email}
              hint="Erscheint im Impressum"
            />
            <Field
              label="Support-E-Mail"
              name="support_email"
              type="email"
              defaultValue={settings.support_email}
            />
            <Field
              label="Presse-E-Mail"
              name="press_email"
              type="email"
              defaultValue={settings.press_email}
            />
          </div>

          <Checkbox
            label="Kleinunternehmer nach § 19 UStG (keine Umsatzsteuer ausweisen)"
            name="small_business"
            defaultChecked={settings.small_business}
          />

          <button type="submit" className="os-btn os-btn-signal justify-self-start">
            Unternehmen speichern
          </button>
        </form>
      </Card>

      <Card title="Shop">
        <form action={saveShopSettings} className="grid gap-5">
          <TextArea
            label="Announcement-Zeilen"
            name="announcements"
            rows={3}
            defaultValue={settings.announcements.join("\n")}
          />
          <p className="-mt-3 text-[0.625rem] text-smoke">
            Eine Zeile pro Meldung. Läuft oben im Shop als Ticker durch.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Instagram URL" name="instagram_url" defaultValue={settings.instagram_url} />
            <Field label="TikTok URL" name="tiktok_url" defaultValue={settings.tiktok_url} />
            <Field
              label="Hero-Video URL"
              name="hero_video_url"
              defaultValue={settings.hero_video_url}
              hint="Leer = generierter Hintergrund"
            />
            <Field
              label="Hero-Bild URL"
              name="hero_image_url"
              defaultValue={settings.hero_image_url}
              hint="Posterframe für das Video"
            />
          </div>
          <button type="submit" className="os-btn os-btn-signal justify-self-start">
            Shop speichern
          </button>
        </form>
      </Card>

      <Card title="Versand">
        <form action={saveShippingSettings} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-4">
            <Field
              label="Versandkosten (€)"
              name="shipping_rate"
              defaultValue={euros(settings.shipping_rate)}
            />
            <Field
              label="Gratis ab (€)"
              name="free_shipping_threshold"
              defaultValue={euros(settings.free_shipping_threshold)}
            />
            <Field
              label="Lieferzeit min. (Werktage)"
              name="delivery_min_days"
              type="number"
              defaultValue={settings.delivery_min_days}
            />
            <Field
              label="Lieferzeit max. (Werktage)"
              name="delivery_max_days"
              type="number"
              defaultValue={settings.delivery_max_days}
            />
          </div>
          <TextArea
            label="Versandländer"
            name="shipping_countries"
            rows={2}
            defaultValue={settings.shipping_countries.join(", ")}
          />
          <p className="-mt-3 text-[0.625rem] text-smoke">
            ISO-Ländercodes, durch Komma getrennt. Steuert die Auswahl im
            Stripe-Checkout.
          </p>
          <button type="submit" className="os-btn os-btn-signal justify-self-start">
            Versand speichern
          </button>
        </form>
      </Card>

      <Card title="Zahlungen">
        <form action={savePaymentSettings} className="grid gap-6">
          <fieldset>
            <legend className="os-eyebrow mb-4">Akzeptierte Zahlungsarten</legend>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PAYMENT_METHODS.map((method) => (
                <li key={method.value}>
                  <label className="os-label flex items-center gap-3 text-[0.6875rem]">
                    <input
                      type="checkbox"
                      name="payment_methods"
                      value={method.value}
                      defaultChecked={settings.payment_methods.includes(method.value)}
                      className="size-4 accent-signal"
                    />
                    {method.label}
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-[70ch] text-[0.625rem] leading-relaxed text-smoke">
              Nichts angehakt = empfohlene Einstellung: Stripe zeigt automatisch
              die Methoden, die du im Stripe-Dashboard aktiviert hast, passend
              zum Land der Kundin. Hakst du etwas an, erzwingst du genau diese
              Liste — dann muss die Methode auch in Stripe freigeschaltet sein,
              sonst schlägt der Checkout fehl.
            </p>
          </fieldset>

          <div className="grid gap-4 border-t os-rule pt-6">
            <Checkbox
              label="Automatic Tax (Stripe berechnet die Steuer)"
              name="automatic_tax"
              defaultChecked={settings.automatic_tax}
            />
            <Checkbox
              label="Rabattcodes im Checkout erlauben"
              name="promotion_codes"
              defaultChecked={settings.promotion_codes}
            />
            <Checkbox
              label="Rechnung automatisch erzeugen"
              name="invoice_creation"
              defaultChecked={settings.invoice_creation}
            />
          </div>

          <button type="submit" className="os-btn os-btn-signal justify-self-start">
            Zahlungen speichern
          </button>
        </form>
      </Card>
    </div>
  );
}
