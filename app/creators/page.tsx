import { createClient } from "@/lib/supabase/server";
import { CreatorCard } from "@/components/cards";
import type { Profile } from "@/types/db";

export const metadata = { title: "Creators" };
export const revalidate = 30;

export default async function CreatorsPage() {
  const supabase = createClient();
  const { data: creators } = await supabase.from("profiles").select("*").eq("role", "creator");
  const { data: stats } = await supabase.from("creator_stats").select("*");
  const { data: counts } = await supabase.from("products").select("creator_id").eq("status", "published");

  const stat = (id: string) => (stats || []).find((s) => s.creator_id === id) || { avg_rating: 0, rating_count: 0 };
  const pcount = (id: string) => (counts || []).filter((p) => p.creator_id === id).length;

  return (
    <div className="fade" style={{ paddingTop: 36 }}>
      <h1 className="serif" style={{ fontSize: 34, margin: "0 0 6px" }}>Creators</h1>
      <p style={{ color: "var(--mute)", margin: "0 0 24px" }}>The painters and sculptors behind Realm. Browse their studios and reach out.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
        {(creators || []).map((c) => <CreatorCard key={c.id} creator={c as Profile} productCount={pcount(c.id)} rating={stat(c.id)} />)}
      </div>
    </div>
  );
}
