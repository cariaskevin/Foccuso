import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { RateLimitResult } from "@/lib/ratelimit";

/**
 * Best-effort client IP. On Vercel/most proxies `x-forwarded-for` is set to a
 * comma-separated list whose first entry is the client. Falls back to a
 * constant so local dev still produces a stable key.
 */
export function ipFromRequest(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "127.0.0.1";
}

/** IP for contexts without a Request object (e.g. server actions). */
export function ipFromHeaders(): string {
  const h = headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "127.0.0.1";
}

/**
 * Standard 429 response with a neutral message and a Retry-After header. Leaks
 * no detail about limits, accounts, or why the request was blocked.
 */
export function tooManyRequests(result: RateLimitResult): NextResponse {
  const retryAfterSec = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Zu viele Anfragen. Bitte versuche es später erneut." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    }
  );
}
