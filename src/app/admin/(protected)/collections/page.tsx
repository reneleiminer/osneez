import { requireSection } from "@/lib/supabase/auth";
import {
  AdminHeading,
  Card,
  Checkbox,
  Field,
  Notice,
  TextArea,
} from "@/components/admin/ui";
import { listCollections } from "@/lib/admin/data";
import { deleteCollection, saveCollection } from "../../actions";

export default async function AdminCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireSection("collections");
  const { saved } = await searchParams;
  const collections = await listCollections();

  return (
    <div className="grid gap-8">
      <AdminHeading
        title="Collections"
        subtitle="Die Linien der Marke. Jedes Produkt kann genau einer zugeordnet werden."
      />
      {saved ? <Notice tone="success">Gespeichert.</Notice> : null}

      <div className="grid gap-3">
        {collections.map((collection) => (
          <Card key={collection.id}>
            <form action={saveCollection} className="grid gap-5">
              <input type="hidden" name="id" value={collection.id} />
              <div className="grid gap-5 md:grid-cols-4">
                <Field label="Name" name="name" required defaultValue={collection.name} />
                <Field label="Slug" name="slug" defaultValue={collection.slug} />
                <Field
                  label="Cover-Bild URL"
                  name="cover_image"
                  defaultValue={collection.cover_image}
                />
                <Field
                  label="Reihenfolge"
                  name="sort_order"
                  type="number"
                  defaultValue={collection.sort_order}
                />
              </div>
              <TextArea
                label="Beschreibung"
                name="description"
                rows={2}
                defaultValue={collection.description}
              />
              <div className="flex flex-wrap items-center gap-6">
                <Checkbox label="Aktiv" name="active" defaultChecked={collection.active} />
                <button type="submit" className="os-btn os-btn-ghost">
                  Speichern
                </button>
              </div>
            </form>
            <form action={deleteCollection} className="mt-4 border-t os-rule pt-4">
              <input type="hidden" name="id" value={collection.id} />
              <button
                type="submit"
                className="os-label text-[0.5625rem] text-smoke hover:text-signal"
              >
                Collection löschen
              </button>
            </form>
          </Card>
        ))}
      </div>

      <Card title="Neue Collection">
        <form action={saveCollection} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-4">
            <Field label="Name" name="name" required placeholder="MOTOR DIVISION" />
            <Field label="Slug" name="slug" hint="Leer = aus dem Namen" />
            <Field label="Cover-Bild URL" name="cover_image" />
            <Field label="Reihenfolge" name="sort_order" type="number" defaultValue={0} />
          </div>
          <TextArea label="Beschreibung" name="description" rows={2} />
          <div className="flex items-center gap-6">
            <Checkbox label="Aktiv" name="active" defaultChecked />
            <button type="submit" className="os-btn os-btn-signal">
              Anlegen
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
