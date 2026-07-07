"use client";

import { useState } from "react";

/** Opens the Stripe Customer Portal for subscription management. */
export function PortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Portal konnte nicht geöffnet werden.");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={openPortal} className="btn-secondary" disabled={loading}>
        {loading ? "Öffnen…" : "Abo verwalten"}
      </button>
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}
