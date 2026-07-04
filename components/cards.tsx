import Link from "next/link";
import { Mini, Avatar, Badge, Stars, LINE, ACCENT2, MUTE, PANEL, stylePalIndex, publicUrlSafe } from "./card-helpers";
import type { Product, Profile, Category } from "@/types/db";

export function ProductCard({ product, creator, category, rating }: {
  product: Product; creator: Profile | null; category?: Category | null;
  rating?: { avg_rating: number; rating_count: number };
}) {
  return (
    <Link href={`/product/${product.id}`} className="card-hover" style={{ display: "block", border: `1px solid ${LINE}`, borderRadius: 16, overflow: "hidden", background: PANEL }}>
      <div style={{ position: "relative" }}>
        <Mini seed={product.id} palIndex={stylePalIndex(product.id)} />
        {category && <span style={{ position: "absolute", top: 10, left: 10 }}><Badge>{category.name}</Badge></span>}
        {product.status === "draft" && <span style={{ position: "absolute", top: 10, right: 10 }}><Badge tone="grey">draft</Badge></span>}
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 600 }}>{product.title}</h3>
          <span className="serif" style={{ color: ACCENT2, fontWeight: 600, whiteSpace: "nowrap" }}>${Number(product.price).toFixed(0)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, color: MUTE, fontSize: 13 }}>
          {creator && <Avatar name={creator.display_name} palIndex={stylePalIndex(creator.id)} url={creator.avatar_url} size={22} />}
          <span>{creator?.display_name}</span>
          {rating && rating.rating_count > 0 && (
            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
              <Stars value={Number(rating.avg_rating)} size={12} /><span style={{ fontSize: 12 }}>{Number(rating.avg_rating).toFixed(1)}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function CreatorCard({ creator, productCount, rating }: {
  creator: Profile; productCount: number; rating: { avg_rating: number; rating_count: number };
}) {
  return (
    <Link href={`/creators/${creator.username}`} className="card-hover" style={{ display: "flex", gap: 14, alignItems: "flex-start", border: `1px solid ${LINE}`, borderRadius: 16, padding: 18, background: PANEL }}>
      <Avatar name={creator.display_name} palIndex={stylePalIndex(creator.id)} url={creator.avatar_url} size={52} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{creator.display_name}</h3>
        <p style={{ margin: "6px 0 10px", color: MUTE, fontSize: 13, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{creator.bio || "Realm creator."}</p>
        <div style={{ display: "flex", gap: 12, fontSize: 12.5, color: MUTE, alignItems: "center" }}>
          {rating.rating_count > 0
            ? <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Stars value={Number(rating.avg_rating)} size={12} />{Number(rating.avg_rating).toFixed(1)}</span>
            : <span>New creator</span>}
          <span>·</span><span>{productCount} {productCount === 1 ? "piece" : "pieces"}</span>
        </div>
      </div>
    </Link>
  );
}

export { publicUrlSafe };
