"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl font-black text-white">Oops</p>
      <h1 className="mt-2 text-xl font-semibold text-white">
        Etwas ist schiefgelaufen
      </h1>
      <p className="mt-2 max-w-sm text-sm text-gray-400">
        Bitte versuche es erneut. Sollte das Problem bestehen bleiben, melde dich
        bei uns.
      </p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="btn-primary">
          Erneut versuchen
        </button>
        <Link href="/" className="btn-secondary">Startseite</Link>
      </div>
    </div>
  );
}
