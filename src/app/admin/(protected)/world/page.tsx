import {
  AdminHeading,
  Card,
  Field,
  Notice,
  TextArea,
} from "@/components/admin/ui";
import { listWorldStories } from "@/lib/admin/data";
import { deleteWorldStory, saveWorldStory } from "../../actions";

function localInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export default async function AdminWorldPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const stories = await listWorldStories();

  return (
    <div className="grid gap-8">
      <AdminHeading
        title="World"
        subtitle="Night runs, Meets, Editorials — alles, was unter /world erscheint."
      />
      {saved ? <Notice tone="success">Gespeichert.</Notice> : null}

      <div className="grid gap-3">
        {stories.map((story) => (
          <Card key={story.id}>
            <form action={saveWorldStory} className="grid gap-5">
              <input type="hidden" name="id" value={story.id} />
              <div className="grid gap-5 md:grid-cols-4">
                <Field label="Titel" name="title" required defaultValue={story.title} />
                <Field label="Slug" name="slug" defaultValue={story.slug} />
                <Field label="Ort" name="location" defaultValue={story.location} />
                <Field
                  label="Zeit-Label"
                  name="timestamp_label"
                  defaultValue={story.timestamp_label}
                />
                <Field
                  label="Cover-Bild URL"
                  name="cover_image"
                  defaultValue={story.cover_image}
                  className="md:col-span-2"
                />
                <Field
                  label="Veröffentlicht"
                  name="published_at"
                  type="datetime-local"
                  defaultValue={localInput(story.published_at)}
                  className="md:col-span-2"
                />
              </div>
              <TextArea
                label="Teaser"
                name="excerpt"
                rows={2}
                defaultValue={story.excerpt}
              />
              <button type="submit" className="os-btn os-btn-ghost justify-self-start">
                Speichern
              </button>
            </form>
            <form action={deleteWorldStory} className="mt-4 border-t os-rule pt-4">
              <input type="hidden" name="id" value={story.id} />
              <button
                type="submit"
                className="os-label text-[0.5625rem] text-smoke hover:text-signal"
              >
                Eintrag löschen
              </button>
            </form>
          </Card>
        ))}
      </div>

      <Card title="Neuer Eintrag">
        <form action={saveWorldStory} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-4">
            <Field label="Titel" name="title" required placeholder="NIGHT RUN 002" />
            <Field label="Slug" name="slug" hint="Leer = aus dem Titel" />
            <Field label="Ort" name="location" placeholder="HAMBURG" />
            <Field label="Zeit-Label" name="timestamp_label" placeholder="01:40 AM" />
            <Field label="Cover-Bild URL" name="cover_image" className="md:col-span-2" />
            <Field
              label="Veröffentlicht"
              name="published_at"
              type="datetime-local"
              className="md:col-span-2"
            />
          </div>
          <TextArea label="Teaser" name="excerpt" rows={2} />
          <button type="submit" className="os-btn os-btn-signal justify-self-start">
            Anlegen
          </button>
        </form>
      </Card>
    </div>
  );
}
