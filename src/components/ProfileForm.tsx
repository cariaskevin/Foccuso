"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Lets a user update their own display name. Note: RLS + a DB trigger ensure
 * that even though this uses the user's own token, ONLY full_name can change –
 * role / stripe / subscription columns are rejected at the database level.
 */
export function ProfileForm({
  userId,
  initialName,
}: {
  userId: string;
  initialName: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", userId);

    if (error) {
      setStatus("error");
      return;
    }
    setStatus("saved");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="fullName">Name</label>
        <input
          id="fullName"
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={status === "saving"}>
          {status === "saving" ? "Speichern…" : "Speichern"}
        </button>
        {status === "saved" && (
          <span className="text-sm text-gold-soft">Gespeichert ✓</span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-300">Fehler beim Speichern.</span>
        )}
      </div>
    </form>
  );
}
