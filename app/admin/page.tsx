import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { AdminClient } from "./client";
import type { Product, Profile, Order } from "@/types/db";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const me = await getCurrentProfile();
  if (!me) redirect("/login?next=/admin");
  if (me.role !== "admin") redirect("/");

  const supabase = createClient();
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  const { data: products } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  const { data: orders } = await supabase.from("orders").select("id,status");
  const { data: reports } = await supabase.from("listing_reports").select("*").order("created_at", { ascending: false });

  return (
    <div className="fade" style={{ paddingTop: 32 }}>
      <h1 className="serif" style={{ fontSize: 28, margin: "0 0 18px" }}>Admin</h1>
      <AdminClient
        users={(users || []) as Profile[]}
        products={(products || []) as Product[]}
        orders={(orders || []) as Pick<Order, "id" | "status">[]}
        reports={(reports || []) as any[]}
      />
    </div>
  );
}
