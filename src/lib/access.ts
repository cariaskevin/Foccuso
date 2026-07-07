import type { Profile } from "@/types/database";

/**
 * Single source of truth for "is this user allowed to watch premium content".
 *
 * A member has premium access if they are an admin, OR their subscription is
 * active/trialing and the paid period has not yet ended. This is evaluated
 * server-side against the profile row that only the Stripe webhook can write.
 */
export function hasPremiumAccess(profile: Pick<Profile, "role" | "subscription_status" | "current_period_end"> | null): boolean {
  if (!profile) return false;
  if (profile.role === "admin") return true;

  const activeStatuses = ["active", "trialing"];
  if (!profile.subscription_status || !activeStatuses.includes(profile.subscription_status)) {
    return false;
  }

  if (!profile.current_period_end) return false;
  return new Date(profile.current_period_end).getTime() > Date.now();
}

export function isAdmin(profile: Pick<Profile, "role"> | null): boolean {
  return profile?.role === "admin";
}
