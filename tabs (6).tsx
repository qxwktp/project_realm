import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { OrdersTabs } from "./tabs";
import type { Order, Product, Profile, Rating } from "@/types/db";

export const metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const me = await getCurrentProfile();
  if (!me) redirect("/login?next=/orders");
  const supabase = createClient();

  const { data: asBuyer } = await supabase.from("orders").select("*").eq("buyer_id", me.id).order("created_at", { ascending: false });
  const { data: asCreator } = await supabase.from("orders").select("*").eq("creator_id", me.id).order("created_at", { ascending: false });
  const { data: products } = await supabase.from("products").select("*");
  const { data: profiles } = await supabase.from("profiles").select("id,display_name,avatar_url,username,role,email,bio,socials,created_at,updated_at");
  const { data: ratings } = await supabase.from("ratings").select("*").eq("buyer_id", me.id);

  return (
    <div className="fade" style={{ paddingTop: 32 }}>
      <h1 className="serif" style={{ fontSize: 28, margin: "0 0 18px" }}>Orders</h1>
      <OrdersTabs
        me={me}
        asBuyer={(asBuyer || []) as Order[]}
        asCreator={(asCreator || []) as Order[]}
        products={(products || []) as Product[]}
        profiles={(profiles || []) as Profile[]}
        myRatings={(ratings || []) as Rating[]}
      />
    </div>
  );
}
