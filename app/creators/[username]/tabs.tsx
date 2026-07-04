"use client";
import { useState } from "react";
import { ProductCard } from "@/components/cards";
import { Empty } from "@/components/controls";
import { Mini, Avatar, Stars, LINE, MUTE, TEXT, PANEL, stylePalIndex } from "@/components/ui";
import { publicUrlSafe } from "@/components/card-helpers";
import type { Product, PortfolioItem, Rating, Profile } from "@/types/db";

export function ProfileTabs({ products, portfolio, ratings, buyers, creator }: {
  products: Product[]; portfolio: PortfolioItem[]; ratings: Rating[];
  buyers: Pick<Profile, "id" | "display_name" | "avatar_url">[]; creator: Profile;
}) {
  const [tab, setTab] = useState<"products" | "portfolio" | "reviews">("products");
  const buyer = (id: string) => buyers.find((b) => b.id === id);

  const tabBtn = (k: typeof tab, label: string) => (
    <button key={k} onClick={() => setTab(k)} style={{ background: "none", border: "none", borderBottom: `2px solid ${tab === k ? "var(--accent)" : "transparent"}`, color: tab === k ? TEXT : MUTE, padding: "10px 14px", cursor: "pointer", fontWeight: 600, fontSize: 14, marginBottom: -1 }}>{label}</button>
  );

  return (
    <>
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${LINE}`, marginBottom: 22 }}>
        {tabBtn("products", `Products (${products.length})`)}
        {tabBtn("portfolio", `Portfolio (${portfolio.length})`)}
        {tabBtn("reviews", `Reviews (${ratings.length})`)}
      </div>

      {tab === "products" && (products.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 18 }}>
          {products.map((p) => <ProductCard key={p.id} product={p} creator={creator} />)}
        </div>
      ) : <Empty title="No products yet" body={`${creator.display_name} hasn't listed any pieces yet. Check back soon.`} />)}

      {tab === "portfolio" && (portfolio.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
          {portfolio.map((pf) => (
            <div key={pf.id} style={{ border: `1px solid ${LINE}`, borderRadius: 14, overflow: "hidden", background: PANEL }}>
              <Mini seed={pf.id} palIndex={stylePalIndex(pf.id)} url={publicUrlSafe("portfolio", pf.path)} />
              <div style={{ padding: 12, fontSize: 13.5 }}>{pf.title}</div>
            </div>
          ))}
        </div>
      ) : <Empty title="No portfolio pieces" body="Work-in-progress shots and finished commissions will show up here." />)}

      {tab === "reviews" && (ratings.length ? (
        <div style={{ display: "grid", gap: 14, maxWidth: 680 }}>
          {ratings.map((rv) => {
            const b = buyer(rv.buyer_id);
            return (
              <div key={rv.id} style={{ border: `1px solid ${LINE}`, borderRadius: 14, padding: 16, background: PANEL }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <Avatar name={b?.display_name || "Buyer"} palIndex={stylePalIndex(rv.buyer_id)} url={b?.avatar_url} size={32} />
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{b?.display_name || "Realm buyer"}</div>
                  <div style={{ marginLeft: "auto" }}><Stars value={rv.score} size={14} /></div>
                </div>
                {rv.text && <p style={{ margin: 0, color: TEXT, lineHeight: 1.5 }}>{rv.text}</p>}
              </div>
            );
          })}
        </div>
      ) : <Empty icon="★" title="No reviews yet" body="Reviews appear after a buyer completes an order with this creator." />)}
    </>
  );
}
