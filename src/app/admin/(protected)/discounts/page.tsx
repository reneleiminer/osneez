import { requireSection } from "@/lib/supabase/auth";
import {
  AdminHeading,
  Card,
  Empty,
  Field,
  Notice,
  Select,
  TextArea,
} from "@/components/admin/ui";
import { listDiscounts } from "@/lib/admin/data";
import { formatPrice } from "@/lib/format";
import { fetchRedemptions, stripeConfigured } from "@/lib/stripe/discounts";
import { createDiscount, deleteDiscount, toggleDiscount } from "../../actions";

function formatDate(value: string | null): string {
  if (!value) return "unbegrenzt";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unbegrenzt";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "short" }).format(date);
}

export default async function AdminDiscountsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireSection("discounts");
  const { saved, error } = await searchParams;
  const [discounts, redemptions] = await Promise.all([
    listDiscounts(),
    fetchRedemptions(),
  ]);

  return (
    <div className="grid gap-8">
      <AdminHeading
        title="Discounts"
        subtitle="Rabattcodes, die Kundinnen im Checkout eingeben. Angelegt wird parallel in Stripe — dort läuft auch die Einlösung."
      />

      {saved ? <Notice tone="success">Code angelegt.</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      {!stripeConfigured() ? (
        <Notice tone="error">
          <code className="text-bone">STRIPE_SECRET_KEY</code> fehlt. Codes
          lassen sich anlegen, greifen aber erst im Checkout, sobald Stripe
          eingerichtet ist — bestehende Einträge werden dann nicht automatisch
          nachgezogen.
        </Notice>
      ) : null}

      {discounts.length === 0 ? (
        <Empty>Noch keine Rabattcodes.</Empty>
      ) : (
        <div className="overflow-x-auto border os-rule">
          <table className="w-full min-w-max text-left text-xs">
            <thead>
              <tr className="border-b os-rule bg-asphalt/40">
                {[
                  "Code",
                  "Rabatt",
                  "Mindestbestellwert",
                  "Eingelöst",
                  "Gültig bis",
                  "Status",
                  "",
                ].map((head) => (
                  <th
                    key={head}
                    scope="col"
                    className="os-label px-4 py-3 text-[0.5625rem] font-semibold text-smoke"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {discounts.map((discount) => {
                const used =
                  discount.stripe_promotion_code_id &&
                  discount.stripe_promotion_code_id in redemptions
                    ? redemptions[discount.stripe_promotion_code_id]
                    : discount.times_redeemed;

                return (
                  <tr key={discount.id} className="border-b border-bone/5">
                    <td className="px-4 py-4">
                      <p className="os-label text-[0.6875rem]">{discount.code}</p>
                      {discount.description ? (
                        <p className="mt-1 text-[0.625rem] text-smoke">
                          {discount.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 tabular-nums">
                      {discount.kind === "percent"
                        ? `${discount.value} %`
                        : formatPrice(discount.value)}
                    </td>
                    <td className="px-4 py-4 tabular-nums text-smoke">
                      {discount.min_subtotal
                        ? formatPrice(discount.min_subtotal)
                        : "—"}
                    </td>
                    <td className="px-4 py-4 tabular-nums text-smoke">
                      {used}
                      {discount.max_redemptions
                        ? ` / ${discount.max_redemptions}`
                        : ""}
                    </td>
                    <td className="px-4 py-4 text-smoke">
                      {formatDate(discount.expires_at)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={discount.active ? "text-bone" : "text-smoke"}
                      >
                        {discount.active ? "aktiv" : "pausiert"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-4">
                        <form action={toggleDiscount}>
                          <input type="hidden" name="id" value={discount.id} />
                          <input
                            type="hidden"
                            name="active"
                            value={discount.active ? "false" : "true"}
                          />
                          <input
                            type="hidden"
                            name="stripe_promotion_code_id"
                            value={discount.stripe_promotion_code_id ?? ""}
                          />
                          <button
                            type="submit"
                            className="os-label text-[0.5625rem] text-smoke underline hover:text-bone"
                          >
                            {discount.active ? "Pausieren" : "Aktivieren"}
                          </button>
                        </form>
                        <form action={deleteDiscount}>
                          <input type="hidden" name="id" value={discount.id} />
                          <input
                            type="hidden"
                            name="stripe_coupon_id"
                            value={discount.stripe_coupon_id ?? ""}
                          />
                          <button
                            type="submit"
                            className="os-label text-[0.5625rem] text-smoke hover:text-signal"
                          >
                            Löschen
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Card title="Neuer Rabattcode">
        <form action={createDiscount} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="Code"
              name="code"
              required
              placeholder="NIGHTRUN10"
              hint="Wird automatisch großgeschrieben"
            />
            <Select
              label="Art"
              name="kind"
              options={[
                { value: "percent", label: "Prozent" },
                { value: "amount", label: "Fester Betrag (€)" },
              ]}
            />
            <Field
              label="Wert"
              name="value"
              required
              placeholder="10"
              hint="Prozent: 10 · Betrag: 15.00"
            />
            <Field
              label="Mindestbestellwert (€)"
              name="min_subtotal"
              placeholder="optional"
            />
            <Field
              label="Max. Einlösungen"
              name="max_redemptions"
              type="number"
              placeholder="optional"
            />
            <Field label="Gültig bis" name="expires_at" type="datetime-local" />
          </div>
          <TextArea
            label="Notiz"
            name="description"
            rows={2}
          />
          <button type="submit" className="os-btn os-btn-signal justify-self-start">
            Code anlegen
          </button>
        </form>
        <p className="mt-4 max-w-[70ch] text-[0.625rem] leading-relaxed text-smoke">
          Damit Codes im Checkout eingegeben werden können, muss unter Settings →
          Zahlungen &bdquo;Rabattcodes im Checkout erlauben&ldquo; aktiv sein.
        </p>
      </Card>
    </div>
  );
}
