"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Registrierung fehlgeschlagen.");
      setLoading(false);
      return;
    }

    // If email confirmation is disabled, a session is returned -> go to dashboard.
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-2xl text-gold-soft">
          ✉
        </div>
        <h1 className="mt-4 text-2xl font-bold text-white">Fast geschafft</h1>
        <p className="mt-2 text-sm text-gray-400">
          Wir haben dir eine Bestätigungs-E-Mail an <strong>{email}</strong>{" "}
          gesendet. Bestätige deine Adresse, um deinen Account zu aktivieren.
        </p>
        <Link href="/login" className="btn-secondary mt-6 w-full">
          Zum Login
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-bold text-white">Mitglied werden</h1>
      <p className="mt-1 text-sm text-gray-400">
        Erstelle dein kostenloses Konto. Premium schaltest du danach frei.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
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
        <div>
          <label className="label" htmlFor="password">Passwort</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">Mindestens 8 Zeichen.</p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Konto wird erstellt…" : "Konto erstellen"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Bereits Mitglied?{" "}
        <Link href="/login" className="text-gold-soft hover:underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
