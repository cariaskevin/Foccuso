import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-gradient text-base-900 shadow-glow">
        <span className="text-lg font-black tracking-tighter">V</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-wide text-white">VELQOR</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-gold-soft">
          Society
        </span>
      </span>
    </Link>
  );
}
