import { requireSection } from "@/lib/supabase/auth";
import {
  AdminHeading,
  Card,
  Checkbox,
  Field,
  Notice,
  TextArea,
} from "@/components/admin/ui";
import { listDrops } from "@/lib/admin/data";
import { deleteDrop, saveDrop } from "../../actions";

/** ISO timestamp → the value a datetime-local input expects. */
function localInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export default async function AdminDropsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireSection("drops");
  const { saved } = await searchParams;
  const drops = await listDrops();

  return (
    <div className="grid gap-8">
      <AdminHeading
        title="Drops"
        subtitle="Release-Datum in der Zukunft = der Drop erscheint als „Upcoming“, in der Vergangenheit = „Available now“."
      />
      {saved ? <Notice tone="success">Gespeichert.</Notice> : null}

      <div className="grid gap-3">
        {drops.map((drop) => (
          <Card key={drop.id}>
            <form action={saveDrop} className="grid gap-5">
              <input type="hidden" name="id" value={drop.id} />
              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Name" name="name" required defaultValue={drop.name} />
                <Field label="Slug" name="slug" defaultValue={drop.slug} />
                <Field
                  label="Release"
                  name="release_date"
                  type="datetime-local"
                  defaultValue={localInput(drop.release_date)}
                />
                <Field label="Tagline" name="tagline" defaultValue={drop.tagline} />
                <Field label="Hero-Bild URL" name="hero_image" defaultValue={drop.hero_image} />
                <Field label="Hero-Video URL" name="hero_video" defaultValue={drop.hero_video} />
              </div>
              <TextArea
                label="Beschreibung"
                name="description"
                rows={2}
                defaultValue={drop.description}
              />
              <div className="flex flex-wrap items-center gap-6">
                <Checkbox label="Aktiv" name="active" defaultChecked={drop.active} />
                <button type="submit" className="os-btn os-btn-ghost">
                  Speichern
                </button>
              </div>
            </form>
            <form action={deleteDrop} className="mt-4 border-t os-rule pt-4">
              <input type="hidden" name="id" value={drop.id} />
              <button
                type="submit"
                className="os-label text-[0.5625rem] text-smoke hover:text-signal"
              >
                Drop löschen
              </button>
            </form>
          </Card>
        ))}
      </div>

      <Card title="Neuer Drop">
        <form action={saveDrop} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Name" name="name" required placeholder="DROP 003" />
            <Field label="Slug" name="slug" hint="Leer = aus dem Namen" />
            <Field label="Release" name="release_date" type="datetime-local" />
            <Field label="Tagline" name="tagline" placeholder="RIDE LOUD." />
            <Field label="Hero-Bild URL" name="hero_image" />
            <Field label="Hero-Video URL" name="hero_video" />
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
