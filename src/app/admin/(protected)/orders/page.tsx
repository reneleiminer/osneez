import { requireSection } from "@/lib/supabase/auth";
import { AdminHeading, Empty, Notice } from "@/components/admin/ui";
import { listOrders } from "@/lib/admin/data";
import { formatPrice } from "@/lib/format";
import { updateOrderStatus } from "../../actions";

const STATUS = ["pending", "paid", "fulfilled", "refunded", "failed"];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminOrdersPage() {
  await requireSection("orders");
  const orders = await listOrders();

  return (
    <div className="grid gap-8">
      <AdminHeading
        title="Orders"
        subtitle="Kommt automatisch vom Stripe-Webhook. Status auf „fulfilled“ setzen, sobald das Paket raus ist."
      />

      {orders.length === 0 ? (
        <>
          <Empty>Noch keine Bestellungen.</Empty>
          <Notice>
            Wenn hier trotz Testbestellung nichts auftaucht: Der Webhook auf
            <code className="text-bone"> /api/stripe/webhook</code> ist noch
            nicht eingerichtet oder{" "}
            <code className="text-bone">STRIPE_WEBHOOK_SECRET</code> fehlt.
          </Notice>
        </>
      ) : (
        <div className="overflow-x-auto border os-rule">
          <table className="w-full min-w-max text-left text-xs">
            <thead>
              <tr className="border-b os-rule bg-asphalt/40">
                {["Datum", "Kunde", "Positionen", "Summe", "Zahlung", "Status"].map(
                  (head) => (
                    <th
                      key={head}
                      scope="col"
                      className="os-label px-4 py-3 text-[0.5625rem] font-semibold text-smoke"
                    >
                      {head}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-bone/5 align-top">
                  <td className="px-4 py-4 text-smoke">
                    {formatDate(order.created_at)}
                    <p className="mt-1 text-[0.5625rem]">
                      #{order.stripe_session_id.slice(-8).toUpperCase()}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {order.customer_name ?? "—"}
                    <p className="mt-1 text-[0.625rem] text-smoke">
                      {order.email ?? "keine E-Mail"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-smoke">
                    {order.line_items?.length ? (
                      <ul className="grid gap-1">
                        {order.line_items.map((item, index) => (
                          <li key={`${order.id}-${index}`}>
                            {item.quantity}× {item.description}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 tabular-nums">
                    {formatPrice(order.amount_total)}
                  </td>
                  <td className="px-4 py-4 text-smoke">
                    {order.payment_status ?? "—"}
                  </td>
                  <td className="px-4 py-4">
                    <form action={updateOrderStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={order.id} />
                      <label htmlFor={`status-${order.id}`} className="sr-only">
                        Status
                      </label>
                      <select
                        id={`status-${order.id}`}
                        name="status"
                        defaultValue={order.status}
                        className="border os-rule bg-ink px-2 py-1 text-xs"
                      >
                        {STATUS.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="os-label text-[0.5625rem] text-smoke underline hover:text-bone"
                      >
                        Set
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
