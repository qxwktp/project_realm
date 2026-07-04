import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getCreatorStats } from "@/lib/supabase/queries";
import { DashboardClient } from "./client";
import { Empty } from "@/components/controls";
import { BecomeCreatorButton } from "./become-creator";
import type { Product, Order, Category, Profile } from "@/types/db";

export const metadata = { title: "Studio dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const me = await getCurrentProfile();
  if (!me) redirect("/login?next=/dashboard");

  if (me.role !== "creator") {
    return (
      <div style={{ paddingTop: 60 }}>
        <Empty title="Become a creator" body="Open a studio to list your work and receive commissions. It's free during the MVP." action={<BecomeCreatorButton />} />
      </div>
    );
  }

  const supabase = createClient();
  const { data: products } = await supabase.from("products").select("*").eq("creator_id", me.id).order("created_at", { ascending: false });
  const { data: orders } = await supabase.from("orders").select("*").eq("creator_id", me.id).order("created_at", { ascending: false });
  const { data: categories } = await supabase.from("categories").select("*").order("sort");
  const { data: buyers } = await supabase.from("profiles").select("id,display_name,avatar_url,username");
  const stat = await getCreatorStats(me.id);

  return (
    <DashboardClient
      me={me}
      products={(products || []) as Product[]}
      orders={(orders || []) as Order[]}
      categories={(categories || []) as Category[]}
      buyers={(buyers || []) as Profile[]}
      stat={stat}
    />
  );
}
