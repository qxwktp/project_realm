"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function openConversation(creatorId: string, productId?: string | null) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to message a creator." };
  if (user.id === creatorId) return { error: "You can't message yourself." };

  const { data: existing } = await supabase.from("conversations").select("id")
    .eq("buyer_id", user.id).eq("creator_id", creatorId).maybeSingle();
  if (existing) return { ok: true, id: existing.id };

  const { data, error } = await supabase.from("conversations")
    .insert({ buyer_id: user.id, creator_id: creatorId, product_id: productId ?? null })
    .select("id").single();
  if (error) return { error: error.message };
  return { ok: true, id: data.id };
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  if (!content.trim()) return { error: "Message is empty." };
  const { error } = await supabase.from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, content: content.trim() });
  if (error) return { error: error.message };
  revalidatePath("/messages");
  return { ok: true };
}

export async function markRead(conversationId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  await supabase.from("messages").update({ is_read: true })
    .eq("conversation_id", conversationId).neq("sender_id", user.id);
  revalidatePath("/messages");
  return { ok: true };
}
