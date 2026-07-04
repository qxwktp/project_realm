"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createProduct(input: {
  title: string; price: number; category_id: string; description: string; status: "draft" | "published";
}) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not signed in." };
  if (!input.title.trim()) return { error: "Give your product a title." };
  if (!Number.isFinite(input.price) || input.price < 0) return { error: "Enter a valid information price." };
  const { data, error } = await supabase.from("products").insert({
    creator_id: user.id,
    title: input.title.trim(),
    price: input.price,
    category_id: input.category_id || null,
    description: input.description?.trim() || "",
    status: input.status,
  }).select("id").single();
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/catalog");
  return { ok: true, id: data.id };
}

export async function updateProduct(id: string, patch: Partial<{
  title: string; price: number; category_id: string; description: string; status: "draft" | "published" | "hidden";
}>) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not signed in." };
  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) return { error: error.message }; // RLS blocks editing others' products
  revalidatePath("/dashboard");
  revalidatePath(`/product/${id}`);
  revalidatePath("/catalog");
  return { ok: true };
}

export async function deleteProduct(id: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not signed in." };
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/catalog");
  return { ok: true };
}

// Admin moderation: hide / unhide.
export async function setProductHidden(id: string, hidden: boolean) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not signed in." };
  const { error } = await supabase.from("products")
    .update({ status: hidden ? "hidden" : "published" }).eq("id", id);
  if (error) return { error: error.message }; // RLS requires admin
  revalidatePath("/admin");
  revalidatePath("/catalog");
  return { ok: true };
}
