import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getCreatorByUsername, getCreatorStats } from "@/lib/supabase/queries";
import { ProfileTabs } from "./tabs";
import { LogoMark, Avatar, Stars, Badge, PALS, LINE, INK, PANEL, MUTE, TEXT, stylePalIndex } from "@/components/ui";
import { MessageButton } from "./message-button";
import type { Product, Profile, PortfolioItem, Rating } from "@/types/db";

export const revalidate = 30;

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const creator = await getCreatorByUsername(params.username);
  if (!creator) return { title: "Creator not found" };
  return { title: creator.display_name, description: creator.bio?.slice(0, 155) || `${creator.display_name}'s studio on Realm.` };
}

export default async function CreatorProfilePage({ params }: { params: { username: string } }) {
  const creator = await getCreatorByUsername(params.username);
  if (!creator) notFound();
  const me = await getCurrentProfile();
  const supabase = createClient();

  const showAll = me?.id === creator.id || me?.role === "admin";
  const productQuery = supabase.from("products").select("*").eq("creator_id", creator.id).order("created_at", { ascending: false });
  const { data: products } = showAll ? await productQuery : await productQuery.eq("status", "published");
  const { data: portfolio } = await supabase.from("portfolio_items").select("*").eq("creator_id", creator.id).order("sort");
  const { data: ratings } = await supabase.from("ratings").select("*").eq("creator_id", creator.id).order("created_at", { ascending: false });
  const { data: buyers } = await supabase.from("profiles").select("id,display_name,avatar_url").in("id", (ratings || []).map((r) => r.buyer_id).length ? (ratings || []).map((r) => r.buyer_id) : ["none"]);
  const stat = await getCreatorStats(creator.id);

  const isOwn = me?.id === creator.id;
  const pal = PALS[stylePalIndex(creator.id)];

  return (
    <div className="fade" style={{ paddingTop: 28 }}>
      <div style={{ borderRadius: 20, border: `1px solid ${LINE}`, overflow: "hidden", marginBottom: 28, background: PANEL }}>
        <div style={{ height: 120, background: `linear-gradient(120deg, ${pal[0]}, ${INK} 70%)`, position: "relative" }}>
          <div aria-hidden style={{ position: "absolute", right: 24, top: 18, opacity: .25 }}><LogoMark size={80} color={pal[1]} /></div>
        </div>
        <div style={{ padding: "0 24px 22px", display: "flex", gap: 18, marginTop: -34, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ border: `3px solid ${PANEL}`, borderRadius: "50%" }}>
            <Avatar name={creator.display_name} palIndex={stylePalIndex(creator.id)} url={creator.avatar_url} size={84} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 className="serif" style={{ fontSize: 26, margin: "0 0 4px" }}>{creator.display_name}</h1>
            <div style={{ display: "flex", gap: 14, color: MUTE, fontSize: 13.5, alignItems: "center", flexWrap: "wrap" }}>
              <span>@{creator.username}</span>
              {Number(stat.rating_count) > 0 && <span style={{ display: "flex", gap: 5, alignItems: "center" }}><Stars value={Number(stat.avg_rating)} size={13} /> {Number(stat.avg_rating).toFixed(1)} ({stat.rating_count})</span>}
              <span>{stat.completed_orders} completed {Number(stat.completed_orders) === 1 ? "order" : "orders"}</span>
            </div>
          </div>
          {isOwn ? <Link href="/dashboard"><Badge tone="accent">Edit studio →</Badge></Link>
            : <MessageButton creatorId={creator.id} signedIn={!!me} />}
        </div>
        {creator.bio && <p style={{ padding: "0 24px 20px", margin: 0, color: TEXT, maxWidth: 680, lineHeight: 1.6 }}>{creator.bio}</p>}
        {Object.keys(creator.socials || {}).length > 0 && (
          <div style={{ padding: "0 24px 20px", display: "flex", gap: 10 }}>
            {Object.entries(creator.socials).map(([k, v]) => <Badge key={k}>{k}: @{v}</Badge>)}
          </div>
        )}
      </div>

      <ProfileTabs
        products={(products || []) as Product[]}
        portfolio={(portfolio || []) as PortfolioItem[]}
        ratings={(ratings || []) as Rating[]}
        buyers={(buyers || []) as Pick<Profile, "id" | "display_name" | "avatar_url">[]}
        creator={creator}
      />
    </div>
  );
}
