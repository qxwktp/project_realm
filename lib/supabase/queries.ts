// Reusable data helpers. All run with the caller's RLS context.
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/db";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data as Profile | null;
}

export async function getCreatorByUsername(username: string) {
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*").eq("username", username).eq("role", "creator").single();
  return data as Profile | null;
}

export async function getCreatorStats(creatorId: string) {
  const supabase = createClient();
  const { data } = await supabase.from("creator_stats").select("*").eq("creator_id", creatorId).single();
  return data ?? { creator_id: creatorId, avg_rating: 0, rating_count: 0, completed_orders: 0 };
}

// Public image URL helper for a storage path
export function publicUrl(bucket: string, path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
