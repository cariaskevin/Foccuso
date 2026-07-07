import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";
import { UpgradeCard } from "@/components/UpgradeCard";
import { createClient } from "@/lib/supabase/server";
import { hasPremiumAccess } from "@/lib/access";
import { CATEGORIES } from "@/lib/config";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const premium = hasPremiumAccess(profile);

  const supabase = createClient();
  // RLS ensures only visible videos (non-hidden, or premium if allowed) return.
  const { count } = await supabase
    .from("videos")
    .select("*", { count: "exact", head: true });

  return (
    <>
      <AppNav profile={profile} />
      <main className="container-page py-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Willkommen{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
          </h1>
          <p className="text-gray-400">
            {premium
              ? "Du hast vollen Zugriff auf alle Premium-Inhalte."
              : "Dein kostenloser Zugang. Schalte Premium frei für alle Inhalte."}
          </p>
        </div>

        {!premium && (
          <div className="mt-8">
            <UpgradeCard />
          </div>
        )}

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Module</h2>
            <Link href="/library" className="text-sm text-gold-soft hover:underline">
              Alle Videos →
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/library?category=${encodeURIComponent(cat)}`}
                className="card p-5 transition hover:border-gold/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{cat}</span>
                  <span className="text-gold-soft">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <p className="mt-8 text-sm text-gray-500">
          {typeof count === "number"
            ? `${count} Video${count === 1 ? "" : "s"} für dich verfügbar.`
            : ""}
        </p>
      </main>
    </>
  );
}
