import { createClient } from "@/lib/supabase/server";
import { CatalogBrowser } from "./browser";
import type { Product, Profile, Category } from "@/types/db";

export const metadata = { title: "Catalog" };
export const revalidate = 30;

export default async function CatalogPage() {
  const supabase = createClient();
  const { data: products } = await supabase.from("products").select("*").eq("status", "published").order("created_at", { ascending: false });
  const { data: creators } = await supabase.from("profiles").select("*").eq("role", "creator");
  const { data: categories } = await supabase.from("categories").select("*").order("sort");
  const { data: stats } = await supabase.from("creator_stats").select("*");

  return (
    <div className="fade" style={{ paddingTop: 36 }}>
      <h1 className="serif" style={{ fontSize: 34, margin: "0 0 6px" }}>Catalog</h1>
      <p style={{ color: "var(--mute)", margin: "0 0 24px" }}>Every piece is hand-finished by a Realm creator. Find one, then message them directly.</p>
      <CatalogBrowser
        products={(products || []) as Product[]}
        creators={(creators || []) as Profile[]}
        categories={(categories || []) as Category[]}
        stats={(stats || []) as any[]}
      />
    </div>
  );
}
