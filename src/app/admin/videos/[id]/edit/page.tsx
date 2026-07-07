import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";
import { VideoForm } from "@/components/VideoForm";
import { createClient } from "@/lib/supabase/server";
import { updateVideo } from "../../actions";

export const metadata = { title: "Video bearbeiten" };

export default async function EditVideoPage({
  params,
}: {
  params: { id: string };
}) {
  const { profile } = await requireAdmin();
  const supabase = createClient();
  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!video) notFound();

  // Bind the id so the server action receives (formData) with id fixed.
  const action = updateVideo.bind(null, video.id);

  return (
    <>
      <AppNav profile={profile} />
      <main className="container-page py-10">
        <Link href="/admin/videos" className="text-sm text-gold-soft hover:underline">
          ← Zurück
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Video bearbeiten
        </h1>
        <div className="card mt-6 max-w-2xl p-6">
          <VideoForm action={action} video={video} />
        </div>
      </main>
    </>
  );
}
