import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { publicUrl } from "@/lib/supabase/queries";
import { ProductCard, CreatorCard } from "@/components/cards";
import { Btn } from "@/components/controls";
import { LogoMark, Mini, Badge, ACCENT, ACCENT2, LINE, INK, PANEL, MUTE, TEXT, stylePalIndex } from "@/components/ui";
import type { Product, Profile, Category } from "@/types/db";

export const revalidate = 30;

export default async function HomePage() {
  const supabase = createClient();
  const { data: products } = await supabase.from("products").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(6);
  const { data: creators } = await supabase.from("profiles").select("*").eq("role", "creator").limit(3);
  const { data: categories } = await supabase.from("categories").select("*");
  const { data: stats } = await supabase.from("creator_stats").select("*");
  const { data: counts } = await supabase.from("products").select("creator_id").eq("status", "published");
  const featuredIds = (products || []).map((p) => p.id);
  const { data: images } = featuredIds.length
    ? await supabase.from("product_images").select("product_id,path,sort").in("product_id", featuredIds).order("sort")
    : { data: [] as any[] };

  const cat = (id: string | null) => (categories || []).find((c) => c.id === id) as Category | undefined;
  const creator = (id: string) => (creators || []).find((c) => c.id === id) as Profile | undefined;
  const stat = (id: string) => (stats || []).find((s) => s.creator_id === id) || { avg_rating: 0, rating_count: 0 };
  const pcount = (id: string) => (counts || []).filter((p) => p.creator_id === id).length;
  const img = (pid: string) => {
    const first = (images || []).find((i) => i.product_id === pid);
    return first ? publicUrl("products", first.path) : null;
  };
  const featured = (products || []) as Product[];

  return (
    <div className="fade">
      <section style={{ position: "relative", padding: "clamp(48px,7vw,88px) clamp(24px,4vw,56px)", margin: "20px 0 8px", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 40, alignItems: "center", borderRadius: 24, border: `1px solid ${LINE}`, overflow: "hidden", background: `radial-gradient(120% 100% at 20% 20%, rgba(157,92,255,.16), transparent 55%), linear-gradient(160deg, ${PANEL}, ${INK})` }} className="hero">
        <div style={{ position: "relative", zIndex: 1 }}>
          <Badge tone="accent">Curated, not endless</Badge>
          <h1 className="serif" style={{ fontSize: "clamp(40px,6vw,68px)", lineHeight: 1.02, margin: "18px 0", fontWeight: 700 }}>
            A place to <span style={{ color: ACCENT2 }}>choose</span>,<br />not to search.
          </h1>
          <p style={{ fontSize: 18, color: MUTE, lineHeight: 1.6, maxWidth: 480, margin: 0 }}>
            Realm connects the painters behind hand-finished 3D miniatures with the players who want them. Find a creator whose work you love, message them directly, and commission the piece for your table.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
            <Link href="/catalog"><Btn size="lg">Browse the catalog</Btn></Link>
            <Link href="/login?mode=register"><Btn size="lg" variant="ghost">Sell your work</Btn></Link>
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {featured.slice(0, 4).map((p, i) => (
            <Link key={p.id} href={`/product/${p.id}`} className="card-hover" style={{ border: `1px solid ${LINE}`, borderRadius: 14, overflow: "hidden", transform: i % 2 ? "translateY(18px)" : "none", background: PANEL }}>
              <Mini seed={p.id} palIndex={stylePalIndex(p.id)} ratio="1 / 1" url={img(p.id)} />
              <div style={{ padding: "8px 10px", fontSize: 13, fontWeight: 600 }}>{p.title}</div>
            </Link>
          ))}
        </div>
      </section>

      <SectionTitle n="01" title="Featured this week" action={<Link className="link" href="/catalog">View all →</Link>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 18 }}>
        {featured.map((p) => <ProductCard key={p.id} product={p} creator={creator(p.creator_id) || null} category={cat(p.category_id)} rating={stat(p.creator_id)} imageUrl={img(p.id)} />)}
      </div>

      <SectionTitle n="02" title="Creators to know" action={<Link className="link" href="/creators">All creators →</Link>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
        {(creators || []).map((c) => <CreatorCard key={c.id} creator={c as Profile} productCount={pcount(c.id)} rating={stat(c.id)} />)}
      </div>

      <section style={{ marginTop: 64, padding: 40, borderRadius: 20, border: `1px solid ${LINE}`, background: `linear-gradient(135deg, ${PANEL}, ${INK})`, textAlign: "center" }}>
        <h2 className="serif" style={{ fontSize: 28, margin: "0 0 10px" }}>Paint for a living?</h2>
        <p style={{ color: MUTE, maxWidth: 480, margin: "0 auto 22px", lineHeight: 1.6 }}>Set up a studio page, show your portfolio, and let buyers come to you. No listing fees during the MVP.</p>
        <Link href="/login?mode=register"><Btn size="lg">Open your studio</Btn></Link>
      </section>
      <style>{`@media (max-width:820px){ .hero{ grid-template-columns:1fr!important } }`}</style>
    </div>
  );
}

function SectionTitle({ n, title, action }: { n: string; title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", margin: "56px 0 22px", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        {n && <span className="serif" style={{ color: ACCENT, fontSize: 14, letterSpacing: ".1em", opacity: .8 }}>{n}</span>}
        <h2 className="serif" style={{ fontSize: 26, margin: 0 }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}
