import Link from "next/link";
import { Logo } from "./Logo";
import { SignOutButton } from "./SignOutButton";
import type { Profile } from "@/types/database";
import { hasPremiumAccess, isAdmin } from "@/lib/access";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/library", label: "Videobibliothek" },
  { href: "/account", label: "Account" },
];

/** Top navigation for the authenticated member area. */
export function AppNav({ profile }: { profile: Profile | null }) {
  const premium = hasPremiumAccess(profile);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-base-900/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-5 text-sm text-gray-300 md:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white">
                {l.label}
              </Link>
            ))}
            {isAdmin(profile) && (
              <Link href="/admin" className="font-medium text-gold-soft hover:text-gold">
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`badge ${
              premium
                ? "border border-gold/30 bg-gold/10 text-gold-soft"
                : "border border-white/10 bg-white/5 text-gray-400"
            }`}
          >
            {premium ? "Premium" : "Free"}
          </span>
          <SignOutButton />
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="flex items-center gap-4 overflow-x-auto border-t border-white/5 px-5 py-2 text-sm text-gray-300 md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-white">
            {l.label}
          </Link>
        ))}
        {isAdmin(profile) && (
          <Link href="/admin" className="whitespace-nowrap font-medium text-gold-soft">
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
}
