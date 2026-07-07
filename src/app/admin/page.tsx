import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const { profile } = await requireAdmin();
  const supabase = createClient();

  const [{ count: videoCount }, { count: userCount }] = await Promise.all([
    supabase.from("videos").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  return (
    <>
      <AppNav profile={profile} />
      <main className="container-page py-10">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Admin</h1>
        <p className="text-gray-400">Verwalte Inhalte und Mitglieder.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="card p-6">
            <div className="text-3xl font-black text-white">{videoCount ?? 0}</div>
            <div className="mt-1 text-sm text-gray-400">Videos</div>
            <Link href="/admin/videos" className="btn-secondary mt-4 inline-flex">
              Videos verwalten
            </Link>
          </div>
          <div className="card p-6">
            <div className="text-3xl font-black text-white">{userCount ?? 0}</div>
            <div className="mt-1 text-sm text-gray-400">Nutzer</div>
            <Link href="/admin/users" className="btn-secondary mt-4 inline-flex">
              Nutzer ansehen
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
