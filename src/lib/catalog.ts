import { createAdminClient } from "@/lib/supabase/admin";
import type { CatalogVideo } from "@/types/database";
import type { Category } from "@/lib/config";

/**
 * SERVER ONLY. Safe catalog access that replaces the old SQL view.
 *
 * These queries deliberately select ONLY non-sensitive columns – the playback
 * fields (`video_url_or_id`, `video_provider`) are never fetched, so they can
 * never leak to a non-premium user through the teaser/lock path. Running on the
 * service-role client lets us show premium *teasers* (title/thumbnail) to free
 * users for the upsell, while the real `videos` table stays locked down by RLS
 * (premium rows incl. the URL are withheld from non-premium users entirely).
 *
 * Only ever call this from server components / server actions.
 */

// Explicit safe projection. Adding a column here is a conscious decision.
const SAFE_COLUMNS =
  "id, title, description, category, thumbnail_url, access_level, created_at";

export async function getCatalog(category?: Category | null): Promise<CatalogVideo[]> {
  const admin = createAdminClient();
  let query = admin
    .from("videos")
    .select(SAFE_COLUMNS)
    .neq("access_level", "hidden")
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data } = await query;
  return (data ?? []) as unknown as CatalogVideo[];
}

export async function getCatalogVideo(id: string): Promise<CatalogVideo | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("videos")
    .select(SAFE_COLUMNS)
    .eq("id", id)
    .neq("access_level", "hidden")
    .maybeSingle();

  return (data as unknown as CatalogVideo) ?? null;
}
