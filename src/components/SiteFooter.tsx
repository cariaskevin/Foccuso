import Link from "next/link";
import { Logo } from "./Logo";
import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-base-900">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-gray-400">
            {siteConfig.description}
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Plattform</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/#module" className="hover:text-white">Module</Link></li>
            <li><Link href="/#preis" className="hover:text-white">Preis</Link></li>
            <li><Link href="/register" className="hover:text-white">Mitglied werden</Link></li>
            <li><Link href="/login" className="hover:text-white">Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Rechtliches</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/legal/impressum" className="hover:text-white">Impressum</Link></li>
            <li><Link href="/legal/datenschutz" className="hover:text-white">Datenschutz</Link></li>
            <li><Link href="/legal/agb" className="hover:text-white">AGB</Link></li>
            <li><Link href="/legal/widerruf" className="hover:text-white">Widerruf</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-xs text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.</p>
          <p>Erstellt für ambitionierte Macher.</p>
        </div>
      </div>
    </footer>
  );
}
