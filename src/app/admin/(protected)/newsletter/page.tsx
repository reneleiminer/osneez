import { AdminHeading, Empty } from "@/components/admin/ui";
import { listSubscribers } from "@/lib/admin/data";
import { toggleSubscriber } from "../../actions";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "short" }).format(date);
}

export default async function AdminNewsletterPage() {
  const subscribers = await listSubscribers();
  const active = subscribers.filter((entry) => entry.active).length;

  return (
    <div className="grid gap-8">
      <AdminHeading
        title="Newsletter"
        subtitle={`${active} aktive von ${subscribers.length} Anmeldungen.`}
        action={
          subscribers.length ? (
            <a href="/admin/newsletter/export" className="os-btn os-btn-ghost">
              CSV exportieren
            </a>
          ) : undefined
        }
      />

      {subscribers.length === 0 ? (
        <Empty>Noch keine Anmeldungen.</Empty>
      ) : (
        <div className="overflow-x-auto border os-rule">
          <table className="w-full min-w-max text-left text-xs">
            <thead>
              <tr className="border-b os-rule bg-asphalt/40">
                {["E-Mail", "Quelle", "Angemeldet", "Status", ""].map((head) => (
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
              {subscribers.map((entry) => (
                <tr key={entry.id} className="border-b border-bone/5">
                  <td className="px-4 py-3">{entry.email}</td>
                  <td className="px-4 py-3 text-smoke">{entry.source}</td>
                  <td className="px-4 py-3 text-smoke">
                    {formatDate(entry.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={entry.active ? "text-bone" : "text-smoke"}>
                      {entry.active ? "aktiv" : "abgemeldet"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleSubscriber}>
                      <input type="hidden" name="id" value={entry.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={entry.active ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className="os-label text-[0.5625rem] text-smoke underline hover:text-bone"
                      >
                        {entry.active ? "Abmelden" : "Reaktivieren"}
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
