"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteConfig.url}/reset-password`,
    });
    // Always show success to avoid leaking which emails are registered.
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-bold text-white">E-Mail unterwegs</h1>
        <p className="mt-2 text-sm text-gray-400">
          Falls ein Konto zu <strong>{email}</strong> existiert, haben wir dir
          einen Link zum Zurücksetzen deines Passworts gesendet.
        </p>
        <Link href="/login" className="btn-secondary mt-6 w-full">Zum Login</Link>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-bold text-white">Passwort vergessen</h1>
      <p className="mt-1 text-sm text-gray-400">
        Gib deine E-Mail ein und wir senden dir einen Link zum Zurücksetzen.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">E-Mail</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Senden…" : "Link senden"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        <Link href="/login" className="text-gold-soft hover:underline">
          Zurück zum Login
        </Link>
      </p>
    </div>
  );
}
