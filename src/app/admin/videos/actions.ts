"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";
import {
  ACCESS_LEVELS,
  CATEGORIES,
  VIDEO_PROVIDERS,
  type AccessLevel,
  type Category,
  type VideoProvider,
} from "@/lib/config";
import type { VideoInput } from "@/types/database";

/** Server-side rate limit for admin mutations, keyed by the admin's user id. */
async function guardAdmin() {
  const session = await requireAdmin(); // server-side admin gate
  const rl = await rateLimit("adminMutation", session.userId);
  if (!rl.success) {
    throw new Error("Zu viele Anfragen. Bitte versuche es später erneut.");
  }
  return session;
}

function parseVideoForm(formData: FormData): VideoInput {
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "");
  const provider = String(formData.get("video_provider") || "");
  const accessLevel = String(formData.get("access_level") || "");
  const videoId = String(formData.get("video_url_or_id") || "").trim();

  if (!title) throw new Error("Titel ist erforderlich.");
  if (!videoId) throw new Error("Video-URL oder ID ist erforderlich.");
  if (!CATEGORIES.includes(category as Category))
    throw new Error("Ungültige Kategorie.");
  if (!VIDEO_PROVIDERS.includes(provider as VideoProvider))
    throw new Error("Ungültiger Provider.");
  if (!ACCESS_LEVELS.includes(accessLevel as AccessLevel))
    throw new Error("Ungültiges Zugriffslevel.");

  const description = String(formData.get("description") || "").trim();
  const thumbnail = String(formData.get("thumbnail_url") || "").trim();

  return {
    title,
    description: description || null,
    category: category as Category,
    thumbnail_url: thumbnail || null,
    video_provider: provider as VideoProvider,
    video_url_or_id: videoId,
    access_level: accessLevel as AccessLevel,
  };
}

export async function createVideo(formData: FormData) {
  await guardAdmin();
  const input = parseVideoForm(formData);
  const supabase = createClient();
  const { error } = await supabase.from("videos").insert(input);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/videos");
  revalidatePath("/library");
  redirect("/admin/videos");
}

export async function updateVideo(id: string, formData: FormData) {
  await guardAdmin();
  const input = parseVideoForm(formData);
  const supabase = createClient();
  const { error } = await supabase.from("videos").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/videos");
  revalidatePath("/library");
  redirect("/admin/videos");
}

export async function deleteVideo(formData: FormData) {
  await guardAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Fehlende Video-ID.");
  const supabase = createClient();
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/videos");
  revalidatePath("/library");
}
