import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role Supabase client. SERVER ONLY.
 * Bypasses Row Level Security. Use only in trusted server contexts such as the
 * Stripe webhook handler where we must write on behalf of the system, never in
 * response to unverified client input.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
