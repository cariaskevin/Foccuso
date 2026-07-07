import Link from "next/link";
import { Logo } from "./Logo";
import { getSessionProfile } from "@/lib/auth";

/** Public marketing header. Shows Dashboard link when signed in. */
export async function SiteHeader() {
  const session = await getSessionProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-base-900/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-gray-300 md:flex">
          <Link href="/#module" className="hover:text-white">Module</Link>
          <Link href="/#fuer-wen" className="hover:text-white">Für wen</Link>
          <Link href="/#preis" className="hover:text-white">Preis</Link>
          <Link href="/#faq" className="hover:text-white">FAQ</Link>
        </nav>
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard" className="btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost hidden sm:inline-flex">Login</Link>
              <Link href="/register" className="btn-primary">Mitglied werden</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
