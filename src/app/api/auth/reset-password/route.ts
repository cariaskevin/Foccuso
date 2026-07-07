import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";
import { ipFromRequest, tooManyRequests } from "@/lib/request";

/**
 * Rate-limited password update. Relies on the recovery session cookie that
 * /auth/callback established from the reset link. Requires a valid session, so
 * it cannot be brute-forced without a valid recovery token.
 */
export async function POST(req: NextRequest) {
  const rl = await rateLimit("resetPassword", ipFromRequest(req));
  if (!rl.success) return tooManyRequests(rl);

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const password = String(body?.password ?? "");
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Das Passwort muss mindestens 8 Zeichen lang sein." },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return NextResponse.json(
      { error: "Link ungültig oder abgelaufen. Bitte fordere einen neuen an." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
