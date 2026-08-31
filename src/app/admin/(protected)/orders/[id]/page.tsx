import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AdminHeading,
  Card,
  Checkbox,
  Field,
  Notice,
  TextArea,
} from "@/components/admin/ui";
import { getOrder } from "@/lib/admin/data";
import { formatPrice } from "@/lib/format";
import { requireSection } from "@/lib/supabase/auth";
import { saveFulfilment, updateOrderStatus } from "../../../actions";

const STATUS = ["pending", "paid", "fulfilled", "refunded", "failed"];

const CARRIERS = ["DHL", "DPD", "GLS", "Hermes", "UPS", "Deutsche Post"];

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Stripe returns the collected address as a nested, loosely typed object. */
function addressLines(details: unknown): string[] {
  if (!details || typeof details !== "object") return [];
  const shipping = details as {
    name?: string;
    address?: Record<string, string | null>;
  };
  const address = shipping.address ?? {};
  return [
    shipping.name ?? null,
    address.line1 ?? null,
    address.line2 ?? null,
    [address.postal_code, address.city].filter(Boolean).join(" ") || null,
    address.country ?? null,
  ].filter((line): line is string => Boolean(line && line.trim()));
}

export default async function AdminOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireSection("orders");
  const { id } = await params;
  const { saved } = await searchParams;
  const order = await getOrder(id);
  if (!order) notFound();

  const address = addressLines(order.shipping_details);

  return (
    <div className="grid gap-8">
      <AdminHeading
        title={`Order #${order.stripe_session_id.slice(-8).toUpperCase()}`}
        subtitle={`${formatDate(order.created_at)} · ${order.email ?? "keine E-Mail"}`}
        action={
          <div className="flex gap-5">
            <Link
              href={`/admin/orders/${order.id}/slip`}
              className="os-label os-underline text-[0.625rem]"
            >
              Lieferschein
            </Link>
            <Link href="/admin/orders" className="os-label os-underline text-[0.625rem]">
              Zurück
            </Link>
          </div>
        }
      />

      {saved ? <Notice tone="success">Gespeichert.</Notice> : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <Card title="Positionen">
          {order.line_items?.length ? (
            <ul className="grid gap-2 text-sm">
              {order.line_items.map((item, index) => (
                <li
                  key={`${order.id}-${index}`}
                  className="flex justify-between border-b border-bone/5 pb-2"
                >
                  <span>
                    <span className="text-smoke">{item.quantity}× </span>
                    {item.description}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-smoke">Keine Positionen gespeichert.</p>
          )}
          <div className="os-label mt-6 flex justify-between border-t os-rule pt-4 text-xs">
            <span className="text-smoke">Gesamt</span>
            <span className="tabular-nums">{formatPrice(order.amount_total)}</span>
          </div>
          <p className="mt-2 text-[0.625rem] text-smoke">
            Zahlung: {order.payment_status ?? "—"}
          </p>
        </Card>

        <Card title="Lieferadresse">
          {address.length ? (
            <address className="text-sm leading-relaxed not-italic">
              {address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          ) : (
            <p className="text-xs text-smoke">
              Keine Adresse übermittelt — Stripe liefert sie erst bei
              abgeschlossener Zahlung.
            </p>
          )}
        </Card>
      </div>

      <Card title="Versand">
        <form action={saveFulfilment} className="grid gap-5">
          <input type="hidden" name="id" value={order.id} />
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label htmlFor="carrier" className="os-eyebrow block">
                Dienstleister
              </label>
              <input
                id="carrier"
                name="carrier"
                list="carrier-options"
                defaultValue={order.carrier ?? ""}
                className="os-input"
              />
              <datalist id="carrier-options">
                {CARRIERS.map((carrier) => (
                  <option key={carrier} value={carrier} />
                ))}
              </datalist>
            </div>
            <Field
              label="Sendungsnummer"
              name="tracking_number"
              defaultValue={order.tracking_number}
            />
            <Field
              label="Tracking-Link"
              name="tracking_url"
              defaultValue={order.tracking_url}
              hint="Wird der Kundin im Account angezeigt"
            />
          </div>
          <TextArea
            label="Interne Notiz"
            name="internal_note"
            rows={2}
            defaultValue={order.internal_note}
          />
          <div className="flex flex-wrap items-center gap-6">
            <Checkbox
              label="Als versendet markieren (setzt Status auf fulfilled)"
              name="mark_shipped"
              defaultChecked={false}
            />
            <button type="submit" className="os-btn os-btn-signal">
              Speichern
            </button>
          </div>
          {order.shipped_at ? (
            <p className="text-[0.625rem] text-smoke">
              Versendet am {formatDate(order.shipped_at)}
            </p>
          ) : null}
        </form>
      </Card>

      <Card title="Status">
        <form action={updateOrderStatus} className="flex flex-wrap items-end gap-4">
          <input type="hidden" name="id" value={order.id} />
          <div>
            <label htmlFor="status" className="os-eyebrow block">
              Bestellstatus
            </label>
            <select
              id="status"
              name="status"
              defaultValue={order.status}
              className="os-input bg-ink"
            >
              {STATUS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="os-btn os-btn-ghost">
            Status setzen
          </button>
        </form>
      </Card>
    </div>
  );
}
