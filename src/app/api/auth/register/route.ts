import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";
import { ipFromRequest, tooManyRequests } from "@/lib/request";
import { siteConfig } from "@/lib/config";

/** Rate-limited registration. */
export async function POST(req: NextRequest) {
  const rl = await rateLimit("register", ipFromRequest(req));
  if (!rl.success) return tooManyRequests(rl);

  let body: { fullName?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const fullName = String(body?.fullName ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-Mail und Passwort sind erforderlich." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Das Passwort muss mindestens 8 Zeichen lang sein." },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteConfig.url}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json(
      { error: "Registrierung fehlgeschlagen. Bitte prüfe deine Angaben." },
      { status: 400 }
    );
  }

  // If email confirmation is disabled, a session is returned immediately.
  return NextResponse.json({ ok: true, session: Boolean(data.session) });
}
