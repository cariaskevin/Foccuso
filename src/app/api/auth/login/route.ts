import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";
import { ipFromRequest, tooManyRequests } from "@/lib/request";

/** Rate-limited login. Runs server-side so the limit can't be bypassed. */
export async function POST(req: NextRequest) {
  const rl = await rateLimit("login", ipFromRequest(req));
  if (!rl.success) return tooManyRequests(rl);

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "");
  if (!email || !password) {
    return NextResponse.json(
      { error: "E-Mail und Passwort sind erforderlich." },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Neutral message – do not reveal whether the email exists.
    return NextResponse.json(
      { error: "E-Mail oder Passwort ist nicht korrekt." },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
