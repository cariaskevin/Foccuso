import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config";
import { rateLimit } from "@/lib/ratelimit";
import { ipFromRequest, tooManyRequests } from "@/lib/request";

/**
 * Opens the Stripe Customer Portal so a member can manage / cancel their
 * subscription. Requires an authenticated user with a Stripe customer id.
 */
export async function POST(req: NextRequest) {
  const rl = await rateLimit("portal", ipFromRequest(req));
  if (!rl.success) return tooManyRequests(rl);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Kein aktives Abo gefunden." },
      { status: 400 }
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${siteConfig.url}/account`,
  });

  return NextResponse.json({ url: session.url });
}
