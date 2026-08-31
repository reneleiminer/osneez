import { notFound } from "next/navigation";

import { getOrder } from "@/lib/admin/data";
import { formatPrice } from "@/lib/format";
import { formatAddress, getSettings } from "@/lib/settings";
import { requireSection } from "@/lib/supabase/auth";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(date);
}

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

/**
 * Packing slip. Printed straight from the browser — light background so it
 * does not swallow a toner cartridge.
 */
export default async function PackingSlipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSection("orders");
  const { id } = await params;
  const [order, settings] = await Promise.all([getOrder(id), getSettings()]);
  if (!order) notFound();

  const sender = formatAddress(settings);
  const recipient = addressLines(order.shipping_details);
  const reference = order.stripe_session_id.slice(-8).toUpperCase();

  return (
    <div className="mx-auto max-w-[46rem] bg-paper p-10 text-void print:p-0">
      <div className="flex items-start justify-between border-b border-void/20 pb-6">
        <div>
          <p className="os-display text-3xl tracking-[-0.03em]">OSNEEZ®</p>
          <address className="mt-3 text-[0.6875rem] leading-relaxed text-void/70 not-italic">
            {sender.length ? (
              sender.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))
            ) : (
              <span>[Firmendaten unter Settings hinterlegen]</span>
            )}
          </address>
        </div>
        <div className="text-right">
          <p className="os-label text-[0.625rem] text-void/60">Lieferschein</p>
          <p className="os-display mt-1 text-2xl">#{reference}</p>
          <p className="mt-2 text-[0.6875rem] text-void/70">
            {formatDate(order.created_at)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <p className="os-label text-[0.625rem] text-void/60">Empfänger</p>
          <address className="mt-2 text-sm leading-relaxed not-italic">
            {recipient.length ? (
              recipient.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))
            ) : (
              <span className="text-void/60">Keine Adresse übermittelt</span>
            )}
          </address>
        </div>
        <div>
          <p className="os-label text-[0.625rem] text-void/60">Versand</p>
          <p className="mt-2 text-sm">
            {order.carrier ?? "—"}
            {order.tracking_number ? (
              <span className="block text-[0.75rem] text-void/70">
                {order.tracking_number}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <table className="mt-10 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-void/20">
            <th scope="col" className="os-label py-2 text-[0.5625rem] text-void/60">
              Menge
            </th>
            <th scope="col" className="os-label py-2 text-[0.5625rem] text-void/60">
              Artikel
            </th>
          </tr>
        </thead>
        <tbody>
          {(order.line_items ?? []).map((item, index) => (
            <tr key={`${order.id}-${index}`} className="border-b border-void/10">
              <td className="py-3 pr-6 tabular-nums align-top">{item.quantity}</td>
              <td className="py-3">{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 flex justify-between border-t border-void/20 pt-4 text-sm">
        <span className="os-label text-[0.625rem] text-void/60">
          Gesamt (inkl. MwSt.)
        </span>
        <span className="tabular-nums">{formatPrice(order.amount_total)}</span>
      </div>

      <p className="mt-10 max-w-[60ch] text-[0.6875rem] leading-relaxed text-void/60">
        Ride loud. Rückgaben innerhalb von 14 Tagen, ungetragen und mit Etikett —
        Details auf {settings.contact_email ? settings.contact_email : "unserer Website"} oder
        unter /returns.
      </p>

      <p className="os-label mt-10 border border-void/30 px-4 py-3 text-[0.625rem] text-void/60 print:hidden">
        Drucken mit Strg/Cmd + P
      </p>
    </div>
  );
}
