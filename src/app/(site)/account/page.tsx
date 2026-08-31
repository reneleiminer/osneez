import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCustomer, getCustomerOrders } from "@/lib/account";
import { formatPrice } from "@/lib/format";
import { customerSignOut, requestReturn } from "./actions";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "In Bearbeitung",
  paid: "Bezahlt",
  fulfilled: "Versendet",
  refunded: "Erstattet",
  failed: "Fehlgeschlagen",
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(date);
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ returned?: string; error?: string }>;
}) {
  const { returned, error } = await searchParams;
  const user = await getCustomer();
  if (!user) redirect("/account/login");

  const orders = await getCustomerOrders();

  return (
    <div className="os-edge py-14 lg:py-20">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b os-rule pb-8">
        <div>
          <p className="os-eyebrow text-signal">Account</p>
          <h1 className="os-display mt-4 text-[clamp(2.5rem,9vw,5.5rem)] leading-[0.82]">
            Your orders
          </h1>
          <p className="mt-4 text-xs text-smoke">{user.email}</p>
        </div>
        <form action={customerSignOut}>
          <button type="submit" className="os-btn os-btn-ghost">
            Sign out
          </button>
        </form>
      </header>

      {returned ? (
        <p className="mt-8 border-l-2 border-bone pl-4 text-xs text-smoke">
          Rücksendung ist angemeldet. Wir melden uns per E-Mail mit der
          Retourenadresse.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-8 border-l-2 border-signal pl-4 text-xs text-signal">
          Das hat nicht geklappt. Versuch es später erneut.
        </p>
      ) : null}

      {orders.length === 0 ? (
        <div className="mt-12 border os-rule px-6 py-16 text-center">
          <p className="os-display text-3xl">Noch nichts bestellt.</p>
          <p className="mx-auto mt-3 max-w-[44ch] text-sm leading-relaxed text-smoke">
            Sobald du bestellst, erscheinen deine Orders hier — vorausgesetzt,
            du nutzt im Checkout dieselbe E-Mail-Adresse wie für dieses Konto.
          </p>
          <Link href="/shop" className="os-btn os-btn-primary mt-8">
            Zum Shop
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        <ul className="mt-12 grid gap-px bg-bone/10">
          {orders.map((order) => (
            <li key={order.id} className="bg-void py-8">
              <div className="grid gap-4 md:grid-cols-12">
                <div className="md:col-span-3">
                  <p className="os-label text-[0.625rem] text-smoke">
                    #{order.stripe_session_id.slice(-8).toUpperCase()}
                  </p>
                  <p className="mt-2 text-xs text-smoke">
                    {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="md:col-span-6">
                  {order.line_items?.length ? (
                    <ul className="grid gap-1 text-sm">
                      {order.line_items.map((item, index) => (
                        <li key={`${order.id}-${index}`}>
                          <span className="text-smoke">{item.quantity}× </span>
                          {item.description}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-smoke">—</p>
                  )}
                </div>

                <div className="md:col-span-3 md:text-right">
                  <p className="tabular-nums">
                    {formatPrice(order.amount_total)}
                  </p>
                  <p className="os-label mt-2 text-[0.625rem] text-signal">
                    {STATUS_LABEL[order.status] ?? order.status}
                  </p>
                  {order.tracking_number ? (
                    <p className="mt-2 text-[0.625rem] text-smoke">
                      {order.carrier ?? "Sendung"}:{" "}
                      {order.tracking_url ? (
                        <a
                          href={order.tracking_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="os-underline text-bone"
                        >
                          {order.tracking_number}
                        </a>
                      ) : (
                        order.tracking_number
                      )}
                    </p>
                  ) : null}
                </div>
              </div>

              <details className="os-accordion mt-6 border-t os-rule">
                <summary className="flex items-center justify-between py-4">
                  <span className="os-label text-[0.625rem] text-smoke">
                    Rücksendung anmelden
                  </span>
                  <span
                    aria-hidden="true"
                    className="os-accordion-sign text-lg leading-none text-smoke"
                  >
                    +
                  </span>
                </summary>
                <form action={requestReturn} className="grid gap-4 pb-6">
                  <input type="hidden" name="order_id" value={order.id} />
                  <input
                    type="hidden"
                    name="order_reference"
                    value={order.stripe_session_id.slice(-8).toUpperCase()}
                  />
                  <div>
                    <label
                      htmlFor={`items-${order.id}`}
                      className="os-eyebrow block"
                    >
                      Welche Artikel?
                    </label>
                    <input
                      id={`items-${order.id}`}
                      name="items"
                      required
                      placeholder="Pit Hoodie, Größe M"
                      className="os-input"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`reason-${order.id}`}
                      className="os-eyebrow block"
                    >
                      Grund
                    </label>
                    <textarea
                      id={`reason-${order.id}`}
                      name="reason"
                      rows={2}
                      placeholder="Passt nicht, zu klein …"
                      className="os-input resize-y"
                    />
                  </div>
                  <button
                    type="submit"
                    className="os-btn os-btn-ghost justify-self-start"
                  >
                    Rücksendung anmelden
                  </button>
                </form>
              </details>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-12 max-w-[60ch] text-[0.6875rem] leading-relaxed text-smoke">
        Rechnungen kommen per E-Mail von Stripe. Für Retouren oder Fragen zu
        einer Bestellung schreib uns über die{" "}
        <Link href="/contact" className="os-underline text-bone">
          Kontaktseite
        </Link>
        .
      </p>
    </div>
  );
}
