import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container-page flex h-16 items-center">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="container-page py-6 text-center text-xs text-gray-500">
        <Link href="/" className="hover:text-white">
          ← Zurück zur Startseite
        </Link>
      </footer>
    </div>
  );
}
