import { CheckoutButton } from "./CheckoutButton";
import { pricing } from "@/lib/config";

/** Prompts a free user to upgrade to Premium via Stripe Checkout. */
export function UpgradeCard() {
  return (
    <div className="card relative overflow-hidden p-6 shadow-glow sm:p-8">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <span className="badge border border-gold/30 bg-gold/10 text-gold-soft">
            Velqor Society Premium
          </span>
          <h3 className="mt-3 text-xl font-bold text-white">
            Schalte alle Inhalte frei
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Voller Zugriff auf alle Module für {pricing.amount} {pricing.currency}
            /{pricing.interval}. Monatlich kündbar.
          </p>
        </div>
        <CheckoutButton />
      </div>
    </div>
  );
}
