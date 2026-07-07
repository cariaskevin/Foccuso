/**
 * Central, typed configuration. Values that are safe for the browser use the
 * NEXT_PUBLIC_ prefix. Secrets are read only in server-side modules.
 */

export const siteConfig = {
  name: "Velqor Society",
  tagline: "Exklusiver Zugang. Echtes Wissen. Messbarer Fortschritt.",
  description:
    "Velqor Society ist die digitale Mitgliederplattform für ambitionierte Macher – exklusive Videos, Module und Tools zu Business, Sales, AI, Crypto, Mindset und Social Media.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

/** Pricing shown in the UI. Source of truth for billing is always Stripe. */
export const pricing = {
  amount: process.env.NEXT_PUBLIC_PREMIUM_PRICE_AMOUNT || "19,99",
  currency: process.env.NEXT_PUBLIC_PREMIUM_PRICE_CURRENCY || "€",
  interval: process.env.NEXT_PUBLIC_PREMIUM_PRICE_INTERVAL || "Monat",
};

/** Content categories used across library + admin. */
export const CATEGORIES = [
  "Business",
  "Sales",
  "AI",
  "Crypto",
  "Mindset",
  "Social Media",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const ACCESS_LEVELS = ["free", "premium", "hidden"] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

export const VIDEO_PROVIDERS = ["cloudflare", "mux", "vimeo", "youtube"] as const;
export type VideoProvider = (typeof VIDEO_PROVIDERS)[number];

export const ROLES = ["free_user", "premium_member", "admin"] as const;
export type Role = (typeof ROLES)[number];
