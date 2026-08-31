import {
  AdminHeading,
  Card,
  Checkbox,
  Empty,
  Field,
  Notice,
  Select,
} from "@/components/admin/ui";
import { listStaff } from "@/lib/admin/data";
import { requireSection } from "@/lib/supabase/auth";
import { deleteStaff, saveStaff } from "../../actions";

const ROLES = [
  { value: "owner", label: "Inhaber — alles inklusive Settings und Team" },
  { value: "editor", label: "Redaktion — Produkte, Drops, World, Rabatte, Texte" },
  { value: "fulfilment", label: "Versand — nur Bestellungen" },
];

const ROLE_SHORT: Record<string, string> = {
  owner: "Inhaber",
  editor: "Redaktion",
  fulfilment: "Versand",
};

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireSection("staff");
  const { saved, error } = await searchParams;
  const staff = await listStaff();

  return (
    <div className="grid gap-8">
      <AdminHeading
        title="Team"
        subtitle="Wer darf ins Backoffice — und was darf er dort sehen."
      />

      {saved ? <Notice tone="success">Gespeichert.</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      <Notice>
        Jede Person braucht zusätzlich einen Login in Supabase unter
        Authentication → Users. Die Adressen aus{" "}
        <code className="text-bone">ADMIN_EMAILS</code> haben immer
        Inhaber-Rechte, unabhängig von dieser Liste — so kannst du dich nicht
        selbst aussperren.
      </Notice>

      {staff.length === 0 ? (
        <Empty>
          Noch niemand eingetragen. Aktuell kommt nur rein, wer in
          ADMIN_EMAILS steht.
        </Empty>
      ) : (
        <div className="overflow-x-auto border os-rule">
          <table className="w-full min-w-max text-left text-xs">
            <thead>
              <tr className="border-b os-rule bg-asphalt/40">
                {["E-Mail", "Name", "Rolle", "Status", ""].map((head) => (
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
              {staff.map((member) => (
                <tr key={member.id} className="border-b border-bone/5">
                  <td className="px-4 py-3">{member.email}</td>
                  <td className="px-4 py-3 text-smoke">{member.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {ROLE_SHORT[member.role] ?? member.role}
                  </td>
                  <td className="px-4 py-3">
                    <span className={member.active ? "text-bone" : "text-smoke"}>
                      {member.active ? "aktiv" : "gesperrt"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={deleteStaff}>
                      <input type="hidden" name="id" value={member.id} />
                      <button
                        type="submit"
                        className="os-label text-[0.5625rem] text-smoke hover:text-signal"
                      >
                        Entfernen
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Card title="Person hinzufügen oder Rolle ändern">
        <form action={saveStaff} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="E-Mail"
              name="email"
              type="email"
              required
              hint="Muss der Supabase-Login-Adresse entsprechen"
            />
            <Field label="Name" name="name" />
            <Select label="Rolle" name="role" options={ROLES} />
          </div>
          <Checkbox label="Zugang aktiv" name="active" defaultChecked />
          <button type="submit" className="os-btn os-btn-signal justify-self-start">
            Speichern
          </button>
        </form>
      </Card>
    </div>
  );
}
