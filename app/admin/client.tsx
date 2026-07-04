"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Btn, Empty } from "@/components/controls";
import { Mini, Avatar, Badge, LINE, ACCENT2, MUTE, PANEL, TEXT, stylePalIndex } from "@/components/ui";
import { setProductHidden } from "@/app/actions/products";
import type { Product, Profile, Order } from "@/types/db";

export function AdminClient({ users, products, orders }: {
  users: Profile[]; products: Product[]; orders: Pick<Order, "id" | "status">[];
}) {
  const [tab, setTab] = useState<"overview" | "products" | "users">("overview");

  const stats: [string, number | string][] = [
    ["Users", users.length],
    ["Creators", users.filter((u) => u.role === "creator").length],
    ["Products", products.length],
    ["Published", products.filter((p) => p.status === "published").length],
    ["Orders", orders.length],
    ["Completed", orders.filter((o) => o.status === "closed").length],
  ];

  const tabBtn = (k: typeof tab, label: string) => (
    <button key={k} onClick={() => setTab(k)} style={{ background: "none", border: "none", borderBottom: `2px solid ${tab === k ? "var(--accent)" : "transparent"}`, color: tab === k ? TEXT : MUTE, padding: "10px 14px", cursor: "pointer", fontWeight: 600, marginBottom: -1 }}>{label}</button>
  );

  return (
    <>
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${LINE}`, marginBottom: 22 }}>
        {tabBtn("overview", "Overview")}
        {tabBtn("products", `Products (${products.length})`)}
        {tabBtn("users", `Users (${users.length})`)}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
          {stats.map(([label, val]) => (
            <div key={label} style={{ border: `1px solid ${LINE}`, borderRadius: 14, padding: 18, background: PANEL }}>
              <div className="serif" style={{ fontSize: 30, color: ACCENT2 }}>{val}</div>
              <div style={{ color: MUTE, fontSize: 13 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "products" && <AdminProducts products={products} users={users} />}

      {tab === "users" && (
        <div style={{ display: "grid", gap: 10 }}>
          {users.map((u) => (
            <div key={u.id} style={{ display: "flex", gap: 12, alignItems: "center", border: `1px solid ${LINE}`, borderRadius: 12, padding: 12, background: PANEL }}>
              <Avatar name={u.display_name} palIndex={stylePalIndex(u.id)} url={u.avatar_url} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{u.display_name} <span style={{ color: MUTE, fontWeight: 400 }}>@{u.username}</span></div>
                <div style={{ color: MUTE, fontSize: 12.5 }}>{u.email}</div>
              </div>
              <Badge tone={u.role === "creator" ? "accent" : u.role === "admin" ? "red" : "blue"}>{u.role}</Badge>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AdminProducts({ products, users }: { products: Product[]; users: Profile[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const creator = (id: string) => users.find((u) => u.id === id);
  if (!products.length) return <Empty title="No products" body="Nothing has been listed yet." />;

  const toggle = async (p: Product) => {
    setBusy(p.id);
    await setProductHidden(p.id, p.status !== "hidden");
    setBusy(null); router.refresh();
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {products.map((p) => (
        <div key={p.id} style={{ display: "flex", gap: 12, alignItems: "center", border: `1px solid ${LINE}`, borderRadius: 12, padding: 12, background: PANEL }}>
          <div style={{ width: 48, minWidth: 48 }}><Mini seed={p.id} palIndex={stylePalIndex(p.id)} ratio="1 / 1" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link href={`/product/${p.id}`} style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</Link>
            <div style={{ color: MUTE, fontSize: 12.5 }}>by {creator(p.creator_id)?.display_name || "—"} · ${Number(p.price).toFixed(0)}</div>
          </div>
          <Badge tone={p.status === "published" ? "green" : p.status === "hidden" ? "red" : "grey"}>{p.status}</Badge>
          <Btn size="sm" variant={p.status === "hidden" ? "soft" : "danger"} onClick={() => toggle(p)} disabled={busy === p.id}>
            {p.status === "hidden" ? "Unhide" : "Hide"}
          </Btn>
        </div>
      ))}
    </div>
  );
}
