import { requireAdmin } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";
import { createClient } from "@/lib/supabase/server";
import { hasPremiumAccess } from "@/lib/access";

export const metadata = { title: "Nutzer" };

const roleBadge: Record<string, string> = {
  admin: "border border-neon/40 bg-neon/10 text-neon-soft",
  premium_member: "border border-gold/30 bg-gold/10 text-gold-soft",
  free_user: "border border-white/10 bg-white/5 text-gray-400",
};

export default async function AdminUsersPage() {
  const { profile } = await requireAdmin();
  const supabase = createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <AppNav profile={profile} />
      <main className="container-page py-10">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Nutzer</h1>
        <p className="text-gray-400">{users?.length ?? 0} registrierte Nutzer</p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-gray-400">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4 font-medium">E-Mail</th>
                <th className="py-3 pr-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Rolle</th>
                <th className="py-3 pr-4 font-medium">Abo-Status</th>
                <th className="py-3 pr-4 font-medium">Zugang bis</th>
                <th className="py-3 pr-4 font-medium">Premium</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u) => (
                <tr key={u.id} className="border-b border-white/5">
                  <td className="py-3 pr-4 text-white">{u.email ?? "—"}</td>
                  <td className="py-3 pr-4 text-gray-300">{u.full_name ?? "—"}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${roleBadge[u.role] ?? roleBadge.free_user}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-300">
                    {u.subscription_status ?? "—"}
                  </td>
                  <td className="py-3 pr-4 text-gray-300">
                    {u.current_period_end
                      ? new Date(u.current_period_end).toLocaleDateString("de-DE")
                      : "—"}
                  </td>
                  <td className="py-3 pr-4">
                    {hasPremiumAccess(u) ? (
                      <span className="text-gold-soft">✓</span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
