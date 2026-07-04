import { createClient } from "@/lib/supabase/server";
import { publicUrl } from "@/lib/supabase/queries";
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
  const ids = (products || []).map((p) => p.id);
  const { data: images } = ids.length
    ? await supabase.from("product_images").select("product_id,path,sort").in("product_id", ids).order("sort")
    : { data: [] as any[] };
  const imageMap: Record<string, string> = {};
  for (const im of images || []) if (!imageMap[im.product_id]) imageMap[im.product_id] = publicUrl("products", im.path);

  return (
    <div className="fade" style={{ paddingTop: 36 }}>
      <h1 className="serif" style={{ fontSize: 34, margin: "0 0 6px" }}>Catalog</h1>
      <p style={{ color: "var(--mute)", margin: "0 0 24px" }}>Every piece is hand-finished by a Realm creator. Find one, then message them directly.</p>
      <CatalogBrowser
        products={(products || []) as Product[]}
        creators={(creators || []) as Profile[]}
        categories={(categories || []) as Category[]}
        stats={(stats || []) as any[]}
        imageMap={imageMap}
      />
    </div>
  );
}
