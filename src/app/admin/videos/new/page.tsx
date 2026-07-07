import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";
import { VideoForm } from "@/components/VideoForm";
import { createVideo } from "../actions";

export const metadata = { title: "Neues Video" };

export default async function NewVideoPage() {
  const { profile } = await requireAdmin();

  return (
    <>
      <AppNav profile={profile} />
      <main className="container-page py-10">
        <Link href="/admin/videos" className="text-sm text-gold-soft hover:underline">
          ← Zurück
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Neues Video
        </h1>
        <div className="card mt-6 max-w-2xl p-6">
          <VideoForm action={createVideo} />
        </div>
      </main>
    </>
  );
}
