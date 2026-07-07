"use client";

export function SignOutButton({ className = "btn-ghost" }: { className?: string }) {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit" className={className}>
        Abmelden
      </button>
    </form>
  );
}
