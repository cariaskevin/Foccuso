import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";
import { PortalButton } from "@/components/PortalButton";
import { ProfileForm } from "@/components/ProfileForm";
import { CheckoutButton } from "@/components/CheckoutButton";
import { hasPremiumAccess } from "@/lib/access";
import { pricing } from "@/lib/config";

export const metadata = { title: "Account" };

const statusLabels: Record<string, string> = {
  active: "Aktiv",
  trialing: "Testphase",
  past_due: "Zahlung überfällig",
  canceled: "Gekündigt",
  unpaid: "Unbezahlt",
  paused: "Pausiert",
};

export default async function AccountPage() {
  const { userId, profile } = await requireUser();
  const premium = hasPremiumAccess(profile);

  return (
    <>
      <AppNav profile={profile} />
      <main className="container-page py-10">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Account</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Membership */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-white">Mitgliedschaft</h2>
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`badge ${
                  premium
                    ? "border border-gold/30 bg-gold/10 text-gold-soft"
                    : "border border-white/10 bg-white/5 text-gray-400"
                }`}
              >
                {premium ? "Premium" : "Free"}
              </span>
              {profile?.subscription_status && (
                <span className="text-sm text-gray-400">
                  {statusLabels[profile.subscription_status] ??
                    profile.subscription_status}
                </span>
              )}
            </div>

            {profile?.current_period_end && (
              <p className="mt-3 text-sm text-gray-400">
                {profile.subscription_status === "canceled"
                  ? "Zugang endet am "
                  : "Nächste Verlängerung am "}
                {new Date(profile.current_period_end).toLocaleDateString("de-DE")}
              </p>
            )}

            <div className="mt-6">
              {profile?.stripe_customer_id ? (
                <PortalButton />
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">
                    Schalte Premium für {pricing.amount} {pricing.currency}/
                    {pricing.interval} frei.
                  </p>
                  <CheckoutButton />
                </div>
              )}
            </div>
          </section>

          {/* Profile */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-white">Profil</h2>
            <p className="mt-1 text-sm text-gray-400">{profile?.email}</p>
            <div className="mt-4">
              <ProfileForm
                userId={userId}
                initialName={profile?.full_name ?? ""}
              />
            </div>
            <div className="mt-6 border-t border-white/5 pt-4">
              <Link
                href="/forgot-password"
                className="text-sm text-gold-soft hover:underline"
              >
                Passwort ändern →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
