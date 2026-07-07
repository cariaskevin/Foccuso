import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";
import { ipFromRequest, tooManyRequests } from "@/lib/request";
import { siteConfig } from "@/lib/config";

/**
 * Rate-limited password-reset request. Always responds 200 (neutral) so it
 * cannot be used to enumerate which emails are registered, and the IP limit
 * prevents using it as an email-spam cannon.
 */
export async function POST(req: NextRequest) {
  const rl = await rateLimit("forgotPassword", ipFromRequest(req));
  if (!rl.success) return tooManyRequests(rl);

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const email = String(body?.email ?? "").trim();
  if (email) {
    const supabase = createClient();
    try {
      // Route the recovery link through /auth/callback so it establishes a
      // server session cookie, which /api/auth/reset-password then uses.
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteConfig.url}/auth/callback?next=/reset-password`,
      });
    } catch {
      // Swallow – never reveal delivery/lookup outcome.
    }
  }

  return NextResponse.json({ ok: true });
}
