import { AdminHeading, Empty } from "@/components/admin/ui";
import { listReturns } from "@/lib/admin/data";
import { requireSection } from "@/lib/supabase/auth";
import { updateReturn } from "../../actions";

const STATUS = ["requested", "approved", "received", "refunded", "rejected"];

const STATUS_LABEL: Record<string, string> = {
  requested: "Angefragt",
  approved: "Genehmigt",
  received: "Eingegangen",
  refunded: "Erstattet",
  rejected: "Abgelehnt",
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminReturnsPage() {
  await requireSection("returns");
  const requests = await listReturns();

  return (
    <div className="grid gap-8">
      <AdminHeading
        title="Returns"
        subtitle="Rücksendungen, die Kundinnen über ihren Account anmelden."
      />

      {requests.length === 0 ? (
        <Empty>Keine offenen Rücksendungen.</Empty>
      ) : (
        <ul className="grid gap-3">
          {requests.map((request) => (
            <li key={request.id} className="border os-rule bg-asphalt/40 p-5">
              <div className="grid gap-5 md:grid-cols-12">
                <div className="md:col-span-3">
                  <p className="os-label text-[0.625rem] text-smoke">
                    {formatDate(request.created_at)}
                  </p>
                  <p className="mt-2 text-xs">{request.email}</p>
                  {request.order_reference ? (
                    <p className="mt-1 text-[0.625rem] text-smoke">
                      Bestellung #{request.order_reference}
                    </p>
                  ) : null}
                </div>

                <div className="md:col-span-5">
                  {request.items ? (
                    <p className="text-xs leading-relaxed">
                      <span className="text-smoke">Artikel: </span>
                      {request.items}
                    </p>
                  ) : null}
                  {request.reason ? (
                    <p className="mt-2 text-xs leading-relaxed text-smoke">
                      {request.reason}
                    </p>
                  ) : null}
                </div>

                <form
                  action={updateReturn}
                  className="grid gap-3 md:col-span-4"
                >
                  <input type="hidden" name="id" value={request.id} />
                  <div>
                    <label
                      htmlFor={`status-${request.id}`}
                      className="os-eyebrow block"
                    >
                      Status
                    </label>
                    <select
                      id={`status-${request.id}`}
                      name="status"
                      defaultValue={request.status}
                      className="os-input bg-ink"
                    >
                      {STATUS.map((value) => (
                        <option key={value} value={value}>
                          {STATUS_LABEL[value] ?? value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor={`note-${request.id}`}
                      className="os-eyebrow block"
                    >
                      Interne Notiz
                    </label>
                    <input
                      id={`note-${request.id}`}
                      name="admin_note"
                      defaultValue={request.admin_note ?? ""}
                      className="os-input"
                    />
                  </div>
                  <button type="submit" className="os-btn os-btn-ghost">
                    Aktualisieren
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
