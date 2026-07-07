import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Server-side rate limiting. Two backends:
 *
 *  - PRODUCTION: Upstash Redis (distributed, works across all serverless
 *    instances). Enabled automatically when UPSTASH_REDIS_REST_URL and
 *    UPSTASH_REDIS_REST_TOKEN are set.
 *  - FALLBACK (dev): an in-memory fixed-window counter. This is PER INSTANCE
 *    only – on Vercel/serverless each cold start / concurrent instance has its
 *    own map, so it is NOT reliable for production. It exists so local dev works
 *    without any external service. See SECURITY_CHECKLIST.md.
 */

export type LimitName =
  | "login"
  | "register"
  | "forgotPassword"
  | "resetPassword"
  | "checkout"
  | "portal"
  | "adminMutation";

// limit = allowed requests per window; windowSec = window length in seconds.
const CONFIG: Record<LimitName, { limit: number; windowSec: number }> = {
  login: { limit: 10, windowSec: 60 }, // brute-force protection
  register: { limit: 5, windowSec: 60 }, // signup abuse
  forgotPassword: { limit: 4, windowSec: 60 }, // email-spam protection
  resetPassword: { limit: 10, windowSec: 60 },
  checkout: { limit: 10, windowSec: 60 }, // no checkout spamming
  portal: { limit: 10, windowSec: 60 },
  adminMutation: { limit: 30, windowSec: 60 },
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** epoch ms when the window resets */
  reset: number;
}

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// ---- Upstash backend (lazy) -----------------------------------------------
let redis: Redis | null = null;
const limiters = new Map<LimitName, Ratelimit>();

function getUpstashLimiter(name: LimitName): Ratelimit | null {
  if (!hasUpstash) return null;
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  let limiter = limiters.get(name);
  if (!limiter) {
    const c = CONFIG[name];
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(c.limit, `${c.windowSec} s`),
      prefix: `rl:${name}`,
      analytics: false,
    });
    limiters.set(name, limiter);
  }
  return limiter;
}

// ---- In-memory fallback ----------------------------------------------------
const memory = new Map<string, { count: number; reset: number }>();

function memoryLimit(name: LimitName, identifier: string): RateLimitResult {
  const c = CONFIG[name];
  const key = `${name}:${identifier}`;
  const now = Date.now();
  const entry = memory.get(key);

  if (!entry || entry.reset <= now) {
    const reset = now + c.windowSec * 1000;
    memory.set(key, { count: 1, reset });
    return { success: true, limit: c.limit, remaining: c.limit - 1, reset };
  }

  entry.count += 1;
  const success = entry.count <= c.limit;
  return {
    success,
    limit: c.limit,
    remaining: Math.max(0, c.limit - entry.count),
    reset: entry.reset,
  };
}

/**
 * Consume one unit against the named limit for the given identifier (usually an
 * IP or user id). Returns whether the request is allowed.
 */
export async function rateLimit(
  name: LimitName,
  identifier: string
): Promise<RateLimitResult> {
  const upstash = getUpstashLimiter(name);
  if (upstash) {
    const r = await upstash.limit(identifier);
    return {
      success: r.success,
      limit: r.limit,
      remaining: r.remaining,
      reset: r.reset,
    };
  }
  return memoryLimit(name, identifier);
}

/** True when the distributed (production-grade) backend is active. */
export function isDistributedRateLimit(): boolean {
  return hasUpstash;
}
