"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ContentType, ListingCategory } from "@/types/db";

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export interface ProductInput {
  title: string; price: number; category_id: string; description: string;
  status: "draft" | "published";
  content_type: ContentType;
  listing_category: ListingCategory;
  base_kit_source?: string;
  license_confirmed?: boolean;
  rights_attestation?: boolean;
  tags: string[];
}

// Enforces the listing rules from the Category Structure Handoff.
function validateListing(i: {
  content_type: ContentType; listing_category: ListingCategory;
  base_kit_source?: string; license_confirmed?: boolean; rights_attestation?: boolean;
  tags: string[];
}): string | null {
  // Original Designs content section defaults to Original classification.
  if (i.content_type === "original_designs" && i.listing_category !== "original") {
    return "Items in Original Designs must be classified as Original Design.";
  }
  if (i.listing_category === "licensed_painting") {
    if (!i.base_kit_source?.trim()) return "Name the official product line you're painting (base kit source).";
    if (!i.license_confirmed) return "Confirm this is an officially purchasable, painting-ready kit.";
  }
  if (i.listing_category === "fan_inspired" && !i.rights_attestation) {
    return "You must accept the rights attestation for a Fan-Inspired listing.";
  }
  if (!i.tags || i.tags.filter((t) => t.trim()).length < 1) {
    return "Add at least one tag so buyers can find this piece.";
  }
  return null;
}

export async function createProduct(input: ProductInput) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not signed in." };
  if (!input.title.trim()) return { error: "Give your product a title." };
  if (!Number.isFinite(input.price) || input.price < 0) return { error: "Enter a valid information price." };
  const invalid = validateListing(input);
  if (invalid) return { error: invalid };
  const cleanTags = input.tags.map((t) => t.trim()).filter(Boolean);
  const { data, error } = await supabase.from("products").insert({
    creator_id: user.id,
    title: input.title.trim(),
    price: input.price,
    category_id: input.category_id || null,
    description: input.description?.trim() || "",
    status: input.status,
    content_type: input.content_type,
    listing_category: input.listing_category,
    base_kit_source: input.listing_category === "licensed_painting" ? (input.base_kit_source?.trim() || "") : "",
    license_confirmed: input.listing_category === "licensed_painting" ? !!input.license_confirmed : false,
    rights_attestation: input.listing_category === "fan_inspired" ? !!input.rights_attestation : false,
    tags: cleanTags,
  }).select("id").single();
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/catalog");
  return { ok: true, id: data.id };
}

export async function updateProduct(id: string, patch: Partial<{
  title: string; price: number; category_id: string; description: string;
  status: "draft" | "published" | "hidden";
  content_type: ContentType; listing_category: ListingCategory;
  base_kit_source: string; license_confirmed: boolean; rights_attestation: boolean; tags: string[];
}>) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not signed in." };
  // If taxonomy fields are part of the update, re-validate the whole listing.
  if (patch.listing_category || patch.content_type) {
    const invalid = validateListing({
      content_type: patch.content_type ?? "original_designs",
      listing_category: patch.listing_category ?? "original",
      base_kit_source: patch.base_kit_source,
      license_confirmed: patch.license_confirmed,
      rights_attestation: patch.rights_attestation,
      tags: patch.tags ?? ["_"],
    });
    if (invalid) return { error: invalid };
  }
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

// Buyers/visitors (signed-in) file an IP/content report on a listing.
export async function reportListing(productId: string, reason: string, details: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Sign in to report a listing." };
  if (!reason.trim()) return { error: "Choose a reason." };
  const { error } = await supabase.from("listing_reports").insert({
    product_id: productId, reporter_id: user.id, reason: reason.trim(), details: details?.trim() || "",
  });
  if (error) return { error: error.message };
  return { ok: true };
}

// Admin: remove a listing, bump the creator's IP flag count (via SQL function).
export async function flagListing(productId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not signed in." };
  const { error } = await supabase.rpc("admin_flag_listing", { p_product_id: productId });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/catalog");
  return { ok: true };
}

// Admin: mark a report as triaged.
export async function setReportStatus(reportId: string, status: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not signed in." };
  const { error } = await supabase.from("listing_reports").update({ status }).eq("id", reportId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}
