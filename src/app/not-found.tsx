import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <Logo />
      <p className="mt-10 text-6xl font-black text-white">404</p>
      <h1 className="mt-2 text-xl font-semibold text-white">Seite nicht gefunden</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-400">
        Die gesuchte Seite existiert nicht oder wurde verschoben.
      </p>
      <Link href="/" className="btn-primary mt-8">Zur Startseite</Link>
    </div>
  );
}
