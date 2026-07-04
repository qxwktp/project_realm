"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Area, Field, Spinner } from "@/components/controls";
import { Modal } from "@/components/modal";
import { Mini, Badge, Stars, LINE, MUTE, PANEL, stylePalIndex } from "@/components/ui";
import { setOrderStatus, rateOrder } from "@/app/actions/orders";
import { openConversation } from "@/app/actions/messaging";
import type { Order, Product, Profile, Rating, OrderStatus } from "@/types/db";

const tone: Record<OrderStatus, "blue" | "accent" | "green" | "grey"> = {
  requested: "blue", accepted: "accent", closed: "green", cancelled: "grey",
};
const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export function OrdersList({ orders, as, products, counterparts, myRatings = [] }: {
  orders: Order[]; as: "buyer" | "creator"; products: Product[]; counterparts: Profile[]; myRatings?: Rating[];
}) {
  const router = useRouter();
  const [rating, setRating] = useState<Order | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const product = (id: string | null) => products.find((p) => p.id === id);
  const person = (id: string) => counterparts.find((c) => c.id === id);
  const rated = (orderId: string) => myRatings.some((r) => r.order_id === orderId);

  const transition = async (id: string, status: OrderStatus) => {
    setBusyId(id); await setOrderStatus(id, status); setBusyId(null); router.refresh();
  };
  const message = async (counterId: string, productId: string | null) => {
    const r = await openConversation(counterId, productId);
    if (r.id) router.push(`/messages?c=${r.id}`);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {orders.map((o) => {
        const p = product(o.product_id);
        const counter = person(as === "buyer" ? o.creator_id : o.buyer_id);
        const busy = busyId === o.id;
        return (
          <div key={o.id} style={{ border: `1px solid ${LINE}`, borderRadius: 14, padding: 14, background: PANEL, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            {p && <div style={{ width: 54, minWidth: 54 }}><Mini seed={p.id} palIndex={stylePalIndex(p.id)} ratio="1 / 1" /></div>}
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <strong>{p?.title || "Custom request"}</strong><Badge tone={tone[o.status]}>{o.status}</Badge>
              </div>
              <div style={{ color: MUTE, fontSize: 13, marginTop: 3 }}>{as === "buyer" ? "Creator" : "Buyer"}: {counter?.display_name} · {timeAgo(o.created_at)}</div>
              {o.note && <div style={{ color: MUTE, fontSize: 13, marginTop: 4, fontStyle: "italic" }}>&ldquo;{o.note}&rdquo;</div>}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn size="sm" variant="ghost" onClick={() => message(as === "buyer" ? o.creator_id : o.buyer_id, o.product_id)}>Message</Btn>
              {as === "creator" && o.status === "requested" && <Btn size="sm" onClick={() => transition(o.id, "accepted")} disabled={busy}>{busy ? <Spinner /> : "Accept"}</Btn>}
              {as === "creator" && o.status === "accepted" && <Btn size="sm" onClick={() => transition(o.id, "closed")} disabled={busy}>{busy ? <Spinner /> : "Mark complete"}</Btn>}
              {as === "creator" && (o.status === "requested" || o.status === "accepted") && <Btn size="sm" variant="danger" onClick={() => transition(o.id, "cancelled")} disabled={busy}>Cancel</Btn>}
              {as === "buyer" && o.status === "requested" && <Btn size="sm" variant="danger" onClick={() => transition(o.id, "cancelled")} disabled={busy}>Withdraw</Btn>}
              {as === "buyer" && o.status === "closed" && !rated(o.id) && <Btn size="sm" onClick={() => setRating(o)}>Leave review</Btn>}
              {as === "buyer" && o.status === "closed" && rated(o.id) && <Badge tone="green">Reviewed</Badge>}
            </div>
          </div>
        );
      })}
      <RatingModal order={rating} creatorName={rating ? person(rating.creator_id)?.display_name : ""} onClose={() => setRating(null)} />
    </div>
  );
}

function RatingModal({ order, creatorName, onClose }: { order: Order | null; creatorName?: string; onClose: () => void }) {
  const router = useRouter();
  const [score, setScore] = useState(5);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (!order) return null;
  const submit = async () => {
    setBusy(true); setErr("");
    const r = await rateOrder(order.id, score, text);
    setBusy(false);
    if (r.error) { setErr(r.error); return; }
    onClose(); router.refresh();
  };
  return (
    <Modal open={!!order} onClose={onClose} title={`Review ${creatorName || "creator"}`}>
      <p style={{ color: MUTE, fontSize: 13.5, marginTop: 0 }}>Reviews can only be left after an order is completed. They help the next buyer choose.</p>
      <Field label="Your rating">
        <div style={{ padding: "4px 0", display: "flex", gap: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setScore(n)} aria-label={`${n} stars`} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
              <Stars value={score >= n ? n : n - 1 < score ? score : 0} size={28} />
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: MUTE }}>{score} / 5</div>
      </Field>
      <Field label="Your review (optional)" error={err}><Area value={text} onChange={(e) => setText(e.target.value)} placeholder="How was the finish, communication, shipping?" /></Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose} disabled={busy}>Cancel</Btn>
        <Btn onClick={submit} disabled={busy}>{busy ? <Spinner /> : "Post review"}</Btn>
      </div>
    </Modal>
  );
}
