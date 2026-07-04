"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/types/db";

export async function createOrder(creatorId: string, productId: string | null, note: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to request an order." };
  if (user.id === creatorId) return { error: "You can't order from yourself." };
  const { data, error } = await supabase.from("orders")
    .insert({ buyer_id: user.id, creator_id: creatorId, product_id: productId, note: note?.trim() || "" })
    .select("id").single();
  if (error) return { error: error.message };
  revalidatePath("/orders");
  return { ok: true, id: data.id };
}

export async function setOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  // RLS enforces who may transition to what (creator vs buyer-cancel).
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath("/orders");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function rateOrder(orderId: string, score: number, text: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  // Look up the order to fill creator_id; trigger + RLS re-validate the rules.
  const { data: order } = await supabase.from("orders")
    .select("creator_id, buyer_id, status").eq("id", orderId).single();
  if (!order) return { error: "Order not found." };
  if (order.status !== "closed") return { error: "You can rate only after the creator closes the order." };
  const { error } = await supabase.from("ratings").insert({
    order_id: orderId, creator_id: order.creator_id, buyer_id: user.id,
    score: Math.max(1, Math.min(5, Math.round(score))), text: text?.trim() || "",
  });
  if (error) return { error: error.message };
  revalidatePath("/orders");
  return { ok: true };
}
