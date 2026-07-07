import type { AccessLevel, Category, Role, VideoProvider } from "@/lib/config";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused"
  | null;

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  stripe_customer_id: string | null;
  subscription_status: SubscriptionStatus;
  current_period_end: string | null; // ISO timestamp
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  thumbnail_url: string | null;
  video_provider: VideoProvider;
  video_url_or_id: string;
  access_level: AccessLevel;
  created_at: string;
}

export type VideoInput = Omit<Video, "id" | "created_at">;

/**
 * Safe catalog shape: everything EXCEPT the sensitive playback columns
 * (video_url_or_id, video_provider). Returned by the server-side safe-column
 * query in src/lib/catalog.ts so premium teasers can be listed without ever
 * fetching or leaking playback URLs.
 */
export type CatalogVideo = Omit<Video, "video_url_or_id" | "video_provider">;

/**
 * Typed shape of the Supabase schema for the JS client generics. The extra
 * empty keys (Functions/Enums/CompositeTypes/Relationships) are required so the
 * supabase-js type resolver matches its GenericSchema and does not fall back to
 * `never` for query results.
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      videos: {
        Row: Video;
        Insert: VideoInput & { id?: string; created_at?: string };
        Update: Partial<VideoInput>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
