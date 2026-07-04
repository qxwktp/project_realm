"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Btn, Input, Area, Select, Field, Spinner } from "@/components/controls";
import { Modal } from "@/components/modal";
import { Mini, Badge, LINE, ACCENT2, MUTE, PANEL, stylePalIndex } from "@/components/ui";
import { OrdersList } from "@/app/orders/orders-list";
import { createProduct, updateProduct, deleteProduct } from "@/app/actions/products";
import type { Product, Order, Category, Profile, CreatorStats } from "@/types/db";

export function DashboardClient({ me, products, orders, categories, buyers, stat }: {
  me: Profile; products: Product[]; orders: Order[]; categories: Category[]; buyers: Profile[]; stat: CreatorStats;
}) {
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const cat = (id: string | null) => categories.find((c) => c.id === id);

  const stats: [string, string | number][] = [
    ["Products", products.length],
    ["Published", products.filter((p) => p.status === "published").length],
    ["Open orders", orders.filter((o) => o.status === "requested" || o.status === "accepted").length],
    ["Rating", Number(stat.rating_count) ? Number(stat.avg_rating).toFixed(1) : "—"],
  ];

  return (
    <div className="fade" style={{ paddingTop: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 22 }}>
        <div>
          <h1 className="serif" style={{ fontSize: 30, margin: "0 0 4px" }}>Studio dashboard</h1>
          <p style={{ color: MUTE, margin: 0 }}>Your public studio: <Link href={`/creators/${me.username}`} className="link">/creators/{me.username}</Link></p>
        </div>
        <Btn onClick={() => setEditing("new")}>+ New product</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 30 }}>
        {stats.map(([label, val]) => (
          <div key={label} style={{ border: `1px solid ${LINE}`, borderRadius: 14, padding: 16, background: PANEL }}>
            <div className="serif" style={{ fontSize: 28, color: ACCENT2 }}>{val}</div>
            <div style={{ color: MUTE, fontSize: 13 }}>{label}</div>
          </div>
        ))}
      </div>

      <h2 className="serif" style={{ fontSize: 22, margin: "0 0 16px" }}>Your products</h2>
      {products.length === 0 ? (
        <div style={{ border: `1px dashed ${LINE}`, borderRadius: 16, padding: 40, textAlign: "center", background: PANEL }}>
          <p style={{ color: MUTE, marginBottom: 16 }}>List your first piece. Buyers find you through the catalog.</p>
          <Btn onClick={() => setEditing("new")}>Create a product</Btn>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {products.map((p) => <ProductRow key={p.id} product={p} category={cat(p.category_id)?.name} onEdit={() => setEditing(p)} />)}
        </div>
      )}

      {orders.length > 0 && (
        <>
          <h2 className="serif" style={{ fontSize: 22, margin: "40px 0 16px" }}>Incoming orders</h2>
          <OrdersList orders={orders} as="creator" products={products} counterparts={buyers} />
        </>
      )}

      <ProductEditor editing={editing} categories={categories} onClose={() => setEditing(null)} />
    </div>
  );
}

function ProductRow({ product, category, onEdit }: { product: Product; category?: string; onEdit: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const toggle = async (status: "published" | "draft") => {
    setBusy(true); await updateProduct(product.id, { status }); setBusy(false); router.refresh();
  };
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center", border: `1px solid ${LINE}`, borderRadius: 14, padding: 12, background: PANEL }}>
      <div style={{ width: 64, minWidth: 64 }}><Mini seed={product.id} palIndex={stylePalIndex(product.id)} ratio="1 / 1" /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <strong style={{ fontSize: 15 }}>{product.title}</strong>
          <Badge tone={product.status === "published" ? "green" : product.status === "hidden" ? "red" : "grey"}>{product.status}</Badge>
        </div>
        <div style={{ color: MUTE, fontSize: 13, marginTop: 3 }}>{category} · ${Number(product.price).toFixed(0)}</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {product.status === "draft" && <Btn size="sm" onClick={() => toggle("published")} disabled={busy}>Publish</Btn>}
        {product.status === "published" && <Btn size="sm" variant="soft" onClick={() => toggle("draft")} disabled={busy}>Unpublish</Btn>}
        <Btn size="sm" variant="ghost" onClick={onEdit}>Edit</Btn>
      </div>
    </div>
  );
}

function ProductEditor({ editing, categories, onClose }: { editing: Product | "new" | null; categories: Category[]; onClose: () => void }) {
  const router = useRouter();
  const isNew = editing === "new";
  const open = !!editing;
  const existing = editing && editing !== "new" ? editing : null;
  const [form, setForm] = useState({ title: "", price: "", category_id: categories[0]?.id || "", description: "", status: "draft" as "draft" | "published" });
  const [err, setErr] = useState<{ title?: string; price?: string }>({});
  const [busy, setBusy] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  // hydrate form when the target changes
  const targetId = existing?.id || (isNew ? "new" : null);
  if (open && targetId !== loadedFor) {
    setLoadedFor(targetId);
    if (existing) setForm({ title: existing.title, price: String(existing.price), category_id: existing.category_id || categories[0]?.id || "", description: existing.description, status: existing.status === "published" ? "published" : "draft" });
    else setForm({ title: "", price: "", category_id: categories[0]?.id || "", description: "", status: "draft" });
    setErr({});
  }

  const save = async (publish: boolean) => {
    const e: typeof err = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (form.price === "" || Number(form.price) < 0 || !Number.isFinite(Number(form.price))) e.price = "Enter a valid price.";
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const status: "draft" | "published" = publish ? "published" : form.status;
    const payload = { title: form.title, price: Number(form.price), category_id: form.category_id, description: form.description, status };
    const r = existing ? await updateProduct(existing.id, payload) : await createProduct(payload);
    setBusy(false);
    if ((r as any)?.error) { setErr({ title: (r as any).error }); return; }
    onClose(); setLoadedFor(null); router.refresh();
  };
  const del = async () => {
    if (!existing) return;
    setBusy(true); await deleteProduct(existing.id); setBusy(false);
    onClose(); setLoadedFor(null); router.refresh();
  };

  return (
    <Modal open={open} onClose={() => { onClose(); setLoadedFor(null); }} title={isNew ? "New product" : "Edit product"} width={520}>
      <Field label="Title" error={err.title}><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Ashen Paladin" error={!!err.title} autoFocus /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Information price (USD)" error={err.price}><Input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="38" error={!!err.price} /></Field>
        <Field label="Category"><Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
      </div>
      <Field label="Description" hint="Describe the finish, base, size, and what makes it yours."><Area value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Resin, hand-painted, 32mm scale…" /></Field>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 4 }}>
        {existing ? <Btn variant="danger" onClick={del} disabled={busy}>Delete</Btn> : <span />}
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={() => save(false)} disabled={busy}>{busy ? <Spinner /> : "Save draft"}</Btn>
          <Btn onClick={() => save(true)} disabled={busy}>{busy ? <Spinner /> : "Publish"}</Btn>
        </div>
      </div>
    </Modal>
  );
}
