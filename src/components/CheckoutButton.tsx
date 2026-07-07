"use client";

import { useState } from "react";

/** Starts a Stripe Checkout session via the server route and redirects. */
export function CheckoutButton({
  className = "btn-primary",
  children = "Premium freischalten",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout konnte nicht gestartet werden.");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={startCheckout} className={className} disabled={loading}>
        {loading ? "Weiterleitung…" : children}
      </button>
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}
