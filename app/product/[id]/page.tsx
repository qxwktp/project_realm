import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, publicUrl } from "@/lib/supabase/queries";
import { ProductCard } from "@/components/cards";
import { Mini, Avatar, Badge, Stars, LINE, ACCENT2, MUTE, TEXT, PANEL, PANEL2, stylePalIndex } from "@/components/ui";
import { ProductActions } from "./actions-ui";
import type { Product, Profile, Category } from "@/types/db";

export const revalidate = 30;

async function load(id: string) {
  const supabase = createClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
  if (!product) return null;
  const { data: creator } = await supabase.from("profiles").select("*").eq("id", product.creator_id).single();
  const { data: categories } = await supabase.from("categories").select("*");
  const { data: stat } = await supabase.from("creator_stats").select("*").eq("creator_id", product.creator_id).maybeSingle();
  const { data: more } = await supabase.from("products").select("*").eq("creator_id", product.creator_id).eq("status", "published").neq("id", id).limit(3);
  const { data: images } = await supabase.from("product_images").select("*").eq("product_id", id).order("sort");
  const imageUrl = images && images.length ? publicUrl("products", images[0].path) : null;
  return { product: product as Product, creator: creator as Profile, categories: (categories || []) as Category[], stat: stat || { avg_rating: 0, rating_count: 0 }, more: (more || []) as Product[], imageUrl };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await load(params.id);
  if (!data) return { title: "Not found" };
  const { product, creator } = data;
  return {
    title: `${product.title} by ${creator.display_name}`,
    description: product.description?.slice(0, 155) || `A hand-finished miniature by ${creator.display_name} on Realm.`,
    openGraph: { title: product.title, description: product.description?.slice(0, 155), type: "website" },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const data = await load(params.id);
  const me = await getCurrentProfile();
  if (!data) notFound();
  const { product, creator, categories, stat, more, imageUrl } = data;

  const visible = product.status === "published" || me?.id === creator.id || me?.role === "admin";
  if (!visible) notFound();

  const cat = categories.find((c) => c.id === product.category_id);
  const isOwn = me?.id === creator.id;
  const ratingCount = Number(stat.rating_count || 0);

  // JSON-LD for richer search results
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: product.title,
    description: product.description, offers: { "@type": "Offer", price: Number(product.price), priceCurrency: "USD" },
    brand: { "@type": "Brand", name: creator.display_name },
  };

  return (
    <div className="fade" style={{ paddingTop: 28 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/catalog" className="link" style={{ fontSize: 13.5, color: MUTE }}>← Back to catalog</Link>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, marginTop: 16, alignItems: "start" }} className="prod">
        <div style={{ position: "sticky", top: 84 }}>
          <Mini seed={product.id} palIndex={stylePalIndex(product.id)} ratio="1 / 1" url={imageUrl} />
        </div>
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {cat && <Badge tone="accent">{cat.name}</Badge>}
            {product.status !== "published" && <Badge tone="grey">{product.status}</Badge>}
          </div>
          <h1 className="serif" style={{ fontSize: 34, margin: "0 0 8px" }}>{product.title}</h1>
          <div className="serif" style={{ fontSize: 26, color: ACCENT2, marginBottom: 4 }}>${Number(product.price).toFixed(0)}</div>
          <p style={{ fontSize: 12.5, color: MUTE, marginBottom: 20 }}>Information price — agree the final amount and shipping directly with the creator.</p>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: TEXT, marginBottom: 24 }}>{product.description}</p>

          <Link href={`/creators/${creator.username}`} className="card-hover" style={{ display: "flex", gap: 12, alignItems: "center", padding: 14, border: `1px solid ${LINE}`, borderRadius: 14, background: PANEL, marginBottom: 20 }}>
            <Avatar name={creator.display_name} palIndex={stylePalIndex(creator.id)} url={creator.avatar_url} size={46} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{creator.display_name}</div>
              <div style={{ fontSize: 13, color: MUTE, display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                {ratingCount > 0 ? <><Stars value={Number(stat.avg_rating)} size={12} /> {Number(stat.avg_rating).toFixed(1)} · {ratingCount} {ratingCount === 1 ? "review" : "reviews"}</> : "New creator"}
              </div>
            </div>
            <span className="link" style={{ fontSize: 13 }}>View studio →</span>
          </Link>

          {isOwn ? (
            <div style={{ padding: 14, border: `1px solid ${LINE}`, borderRadius: 12, background: PANEL2, fontSize: 14, color: MUTE }}>
              This is your listing. Manage it from your <Link href="/dashboard" className="link">dashboard</Link>.
            </div>
          ) : (
            <ProductActions creator={creator} product={product} signedIn={!!me} />
          )}
        </div>
      </div>

      {more.length > 0 && (
        <>
          <h2 className="serif" style={{ fontSize: 24, margin: "56px 0 22px" }}>More from {creator.display_name}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 18 }}>
            {more.map((p) => <ProductCard key={p.id} product={p} creator={creator} category={categories.find((c) => c.id === p.category_id)} rating={stat} />)}
          </div>
        </>
      )}
      <style>{`@media (max-width:760px){ .prod{ grid-template-columns:1fr!important } .prod>div:first-child{ position:static!important } }`}</style>
    </div>
  );
}
