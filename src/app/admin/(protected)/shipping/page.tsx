import {
  AdminHeading,
  Card,
  Checkbox,
  Empty,
  Field,
  Notice,
} from "@/components/admin/ui";
import { listShippingZones } from "@/lib/admin/data";
import { formatPrice } from "@/lib/format";
import { requireSection } from "@/lib/supabase/auth";
import {
  deleteShippingRate,
  deleteShippingZone,
  saveShippingRate,
  saveShippingZone,
} from "../../actions";

export default async function AdminShippingPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireSection("shipping");
  const { saved } = await searchParams;
  const zones = await listShippingZones();

  return (
    <div className="grid gap-8">
      <AdminHeading
        title="Shipping"
        subtitle="Zonen und Tarife. Im Warenkorb wählt die Kundin das Lieferland — daraus ergibt sich, was der Checkout anbietet."
      />

      {saved ? <Notice tone="success">Gespeichert.</Notice> : null}

      <Notice>
        Ein Land gehört in genau eine Zone. Passt keine Zone, greift der
        Standardtarif aus Settings → Versand. Stripe zeigt maximal fünf Tarife
        pro Bestellung.
      </Notice>

      {zones.length === 0 ? (
        <Empty>
          Noch keine Zonen. Lege eine an — bis dahin gilt der Standardtarif aus
          den Einstellungen.
        </Empty>
      ) : null}

      {zones.map((zone) => (
        <Card key={zone.id} title={`Zone · ${zone.name}`}>
          <form action={saveShippingZone} className="grid gap-5">
            <input type="hidden" name="id" value={zone.id} />
            <div className="grid gap-5 md:grid-cols-4">
              <Field label="Name" name="name" required defaultValue={zone.name} />
              <Field
                label="Länder"
                name="countries"
                defaultValue={zone.countries.join(", ")}
                className="md:col-span-2"
                hint="ISO-Codes, durch Komma getrennt"
              />
              <Field
                label="Reihenfolge"
                name="sort_order"
                type="number"
                defaultValue={zone.sort_order}
              />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <Checkbox label="Aktiv" name="active" defaultChecked={zone.active} />
              <button type="submit" className="os-btn os-btn-ghost">
                Zone speichern
              </button>
            </div>
          </form>

          <div className="mt-8 border-t os-rule pt-6">
            <p className="os-eyebrow mb-4">Tarife</p>

            {zone.rates.length === 0 ? (
              <p className="mb-6 text-xs text-smoke">
                Noch kein Tarif in dieser Zone.
              </p>
            ) : (
              <div className="mb-8 overflow-x-auto">
                <table className="w-full min-w-max text-left text-xs">
                  <thead>
                    <tr className="border-b os-rule">
                      {[
                        "Name",
                        "Preis",
                        "Gratis ab",
                        "Ab Warenwert",
                        "Bis Warenwert",
                        "Laufzeit",
                        "Aktiv",
                        "",
                      ].map((head) => (
                        <th
                          key={head}
                          scope="col"
                          className="os-label px-3 py-2 text-[0.5625rem] text-smoke"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {zone.rates.map((rate) => (
                      <tr key={rate.id} className="border-b border-bone/5">
                        <td className="px-3 py-3">{rate.name}</td>
                        <td className="px-3 py-3 tabular-nums">
                          {formatPrice(rate.price)}
                        </td>
                        <td className="px-3 py-3 tabular-nums text-smoke">
                          {rate.free_over === null
                            ? "—"
                            : formatPrice(rate.free_over)}
                        </td>
                        <td className="px-3 py-3 tabular-nums text-smoke">
                          {rate.min_subtotal === null
                            ? "—"
                            : formatPrice(rate.min_subtotal)}
                        </td>
                        <td className="px-3 py-3 tabular-nums text-smoke">
                          {rate.max_subtotal === null
                            ? "—"
                            : formatPrice(rate.max_subtotal)}
                        </td>
                        <td className="px-3 py-3 text-smoke">
                          {rate.delivery_min_days}–{rate.delivery_max_days} Tage
                        </td>
                        <td className="px-3 py-3 text-smoke">
                          {rate.active ? "ja" : "nein"}
                        </td>
                        <td className="px-3 py-3">
                          <form action={deleteShippingRate}>
                            <input type="hidden" name="id" value={rate.id} />
                            <button
                              type="submit"
                              className="os-label text-[0.5625rem] text-smoke hover:text-signal"
                            >
                              Löschen
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <form action={saveShippingRate} className="grid gap-4 md:grid-cols-4">
              <input type="hidden" name="zone_id" value={zone.id} />
              <Field label="Tarifname" name="name" required placeholder="Standard" />
              <Field label="Preis (€)" name="price" required placeholder="4.90" />
              <Field label="Gratis ab (€)" name="free_over" placeholder="optional" />
              <Field label="Reihenfolge" name="sort_order" type="number" defaultValue={0} />
              <Field label="Ab Warenwert (€)" name="min_subtotal" placeholder="optional" />
              <Field label="Bis Warenwert (€)" name="max_subtotal" placeholder="optional" />
              <Field
                label="Laufzeit min."
                name="delivery_min_days"
                type="number"
                defaultValue={2}
              />
              <Field
                label="Laufzeit max."
                name="delivery_max_days"
                type="number"
                defaultValue={5}
              />
              <Field label="Notiz" name="description" className="md:col-span-3" />
              <div className="flex items-end gap-4">
                <Checkbox label="aktiv" name="active" defaultChecked />
                <button type="submit" className="os-btn os-btn-ghost">
                  Tarif anlegen
                </button>
              </div>
            </form>
          </div>

          <form action={deleteShippingZone} className="mt-6 border-t os-rule pt-4">
            <input type="hidden" name="id" value={zone.id} />
            <button
              type="submit"
              className="os-label text-[0.5625rem] text-smoke hover:text-signal"
            >
              Zone samt Tarifen löschen
            </button>
          </form>
        </Card>
      ))}

      <Card title="Neue Zone">
        <form action={saveShippingZone} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-4">
            <Field label="Name" name="name" required placeholder="Schweiz" />
            <Field
              label="Länder"
              name="countries"
              className="md:col-span-2"
              placeholder="CH, LI"
            />
            <Field label="Reihenfolge" name="sort_order" type="number" defaultValue={0} />
          </div>
          <div className="flex items-center gap-6">
            <Checkbox label="Aktiv" name="active" defaultChecked />
            <button type="submit" className="os-btn os-btn-signal">
              Zone anlegen
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
