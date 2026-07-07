import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const ACTIVE = ["active", "trialing"];

/**
 * Writes Stripe subscription truth into the user's profile. SERVER ONLY, and
 * always via the service-role client because normal users are forbidden (by
 * RLS + trigger) from touching role / stripe / subscription columns.
 *
 * Admins are never demoted, regardless of subscription state.
 */
export async function syncSubscriptionToProfile(subscription: Stripe.Subscription) {
  const admin = createAdminClient();
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const status = subscription.status;
  const currentPeriodEnd = new Date(
    subscription.current_period_end * 1000
  ).toISOString();

  // Find the profile linked to this Stripe customer.
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!profile) {
    // Fallback: map via metadata set at checkout time.
    const userId = subscription.metadata?.supabase_user_id;
    if (!userId) return;
    await admin
      .from("profiles")
      .update({
        stripe_customer_id: customerId,
        subscription_status: status,
        current_period_end: currentPeriodEnd,
        role: ACTIVE.includes(status) ? "premium_member" : "free_user",
      })
      .eq("id", userId);
    return;
  }

  const nextRole =
    profile.role === "admin"
      ? "admin"
      : ACTIVE.includes(status)
      ? "premium_member"
      : "free_user";

  await admin
    .from("profiles")
    .update({
      subscription_status: status,
      current_period_end: currentPeriodEnd,
      role: nextRole,
    })
    .eq("id", profile.id);
}

/** Marks a subscription as canceled and removes premium access. */
export async function revokeSubscriptionForCustomer(customerId: string) {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!profile) return;

  await admin
    .from("profiles")
    .update({
      subscription_status: "canceled",
      role: profile.role === "admin" ? "admin" : "free_user",
    })
    .eq("id", profile.id);
}
