"use client";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/cards";
import { Input, Select, Btn, Empty } from "@/components/controls";
import { MUTE } from "@/components/ui";
import type { Product, Profile, Category } from "@/types/db";

export function CatalogBrowser({ products, creators, categories, stats, imageMap }: {
  products: Product[]; creators: Profile[]; categories: Category[]; stats: any[]; imageMap?: Record<string, string>;
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("new");

  const creator = (id: string) => creators.find((c) => c.id === id) || null;
  const cat = (id: string | null) => categories.find((c) => c.id === id) || undefined;
  const stat = (id: string) => stats.find((s) => s.creator_id === id) || { avg_rating: 0, rating_count: 0 };

  const list = useMemo(() => {
    let items = [...products];
    if (category !== "all") items = items.filter((p) => p.category_id === category);
    if (q.trim()) {
      const n = q.toLowerCase();
      items = items.filter((p) => p.title.toLowerCase().includes(n) || p.description.toLowerCase().includes(n) || creator(p.creator_id)?.display_name.toLowerCase().includes(n));
    }
    if (sort === "new") items.sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (sort === "low") items.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "high") items.sort((a, b) => Number(b.price) - Number(a.price));
    return items;
  }, [products, category, q, sort]);

  return (
    <>
      <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: MUTE }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/></svg>
          </span>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search minis, creators…" style={{ paddingLeft: 36 }} aria-label="Search catalog" />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category" style={{ width: "auto", minWidth: 150 }}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort" style={{ width: "auto", minWidth: 140 }}>
          <option value="new">Newest</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </Select>
      </div>

      {list.length === 0 ? (
        <Empty title="No pieces match that" body="Try a different category or clear your search to see the whole catalog." action={<Btn variant="ghost" onClick={() => { setQ(""); setCategory("all"); }}>Clear filters</Btn>} />
      ) : (
        <>
          <div style={{ color: MUTE, fontSize: 13, marginBottom: 14 }}>{list.length} {list.length === 1 ? "piece" : "pieces"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 18 }}>
            {list.map((p) => <ProductCard key={p.id} product={p} creator={creator(p.creator_id)} category={cat(p.category_id)} rating={stat(p.creator_id)} imageUrl={imageMap?.[p.id] || null} />)}
          </div>
        </>
      )}
    </>
  );
}
