import Link from "next/link";
import {
  ACCESS_LEVELS,
  CATEGORIES,
  VIDEO_PROVIDERS,
} from "@/lib/config";
import type { Video } from "@/types/database";

/**
 * Shared create/edit form for videos. `action` is a server action (guarded by
 * requireAdmin) so the write path is validated on the server, not the client.
 */
export function VideoForm({
  action,
  video,
}: {
  action: (formData: FormData) => void;
  video?: Video;
}) {
  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="label" htmlFor="title">Titel *</label>
        <input
          id="title"
          name="title"
          required
          className="input"
          defaultValue={video?.title}
        />
      </div>

      <div>
        <label className="label" htmlFor="description">Beschreibung</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="input"
          defaultValue={video?.description ?? ""}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="category">Kategorie *</label>
          <select
            id="category"
            name="category"
            required
            className="input"
            defaultValue={video?.category ?? CATEGORIES[0]}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="access_level">Zugriff *</label>
          <select
            id="access_level"
            name="access_level"
            required
            className="input"
            defaultValue={video?.access_level ?? "free"}
          >
            {ACCESS_LEVELS.map((a) => (
              <option key={a} value={a}>
                {a === "free" ? "Free" : a === "premium" ? "Premium" : "Hidden"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="video_provider">Provider *</label>
          <select
            id="video_provider"
            name="video_provider"
            required
            className="input"
            defaultValue={video?.video_provider ?? VIDEO_PROVIDERS[0]}
          >
            {VIDEO_PROVIDERS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="video_url_or_id">Video-URL / ID *</label>
          <input
            id="video_url_or_id"
            name="video_url_or_id"
            required
            className="input"
            placeholder="z. B. Stream-UID oder Vimeo-ID"
            defaultValue={video?.video_url_or_id}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="thumbnail_url">Thumbnail-URL</label>
        <input
          id="thumbnail_url"
          name="thumbnail_url"
          type="url"
          className="input"
          placeholder="https://…"
          defaultValue={video?.thumbnail_url ?? ""}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn-primary">
          {video ? "Änderungen speichern" : "Video anlegen"}
        </button>
        <Link href="/admin/videos" className="btn-ghost">Abbrechen</Link>
      </div>
    </form>
  );
}
