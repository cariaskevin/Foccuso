import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";
import { createClient } from "@/lib/supabase/server";
import { deleteVideo } from "./actions";

export const metadata = { title: "Videos verwalten" };

const accessBadge: Record<string, string> = {
  free: "border border-white/10 bg-white/5 text-gray-300",
  premium: "border border-gold/30 bg-gold/10 text-gold-soft",
  hidden: "border border-white/10 bg-white/5 text-gray-500",
};

export default async function AdminVideosPage() {
  const { profile } = await requireAdmin();
  const supabase = createClient();
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <AppNav profile={profile} />
      <main className="container-page py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Videos</h1>
            <p className="text-gray-400">{videos?.length ?? 0} Einträge</p>
          </div>
          <Link href="/admin/videos/new" className="btn-primary">
            + Video
          </Link>
        </div>

        {!videos || videos.length === 0 ? (
          <div className="card mt-8 p-12 text-center">
            <p className="text-gray-400">Noch keine Videos angelegt.</p>
            <Link href="/admin/videos/new" className="btn-primary mt-4 inline-flex">
              Erstes Video anlegen
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-gray-400">
                <tr className="border-b border-white/10">
                  <th className="py-3 pr-4 font-medium">Titel</th>
                  <th className="py-3 pr-4 font-medium">Kategorie</th>
                  <th className="py-3 pr-4 font-medium">Provider</th>
                  <th className="py-3 pr-4 font-medium">Zugriff</th>
                  <th className="py-3 pr-4 font-medium text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr key={v.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-white">{v.title}</td>
                    <td className="py-3 pr-4 text-gray-300">{v.category}</td>
                    <td className="py-3 pr-4 text-gray-300">{v.video_provider}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${accessBadge[v.access_level]}`}>
                        {v.access_level}
                      </span>
                    </td>
                    <td className="py-3 pr-0">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/videos/${v.id}/edit`}
                          className="text-gold-soft hover:underline"
                        >
                          Bearbeiten
                        </Link>
                        <form action={deleteVideo}>
                          <input type="hidden" name="id" value={v.id} />
                          <button
                            type="submit"
                            className="text-red-300 hover:underline"
                          >
                            Löschen
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
