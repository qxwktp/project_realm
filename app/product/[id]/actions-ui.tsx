"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Area, Field, Spinner } from "@/components/controls";
import { Modal } from "@/components/modal";
import { Mini, MUTE, PANEL2, stylePalIndex } from "@/components/ui";
import { openConversation, sendMessage } from "@/app/actions/messaging";
import { createOrder } from "@/app/actions/orders";
import type { Product, Profile } from "@/types/db";

export function ProductActions({ creator, product, signedIn }: { creator: Profile; product: Product; signedIn: boolean }) {
  const router = useRouter();
  const [msgOpen, setMsgOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const firstName = creator.display_name.split(" ")[0];

  const requireAuth = (open: () => void) => () => {
    if (!signedIn) { router.push(`/login?next=/product/${product.id}`); return; }
    open();
  };

  return (
    <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Btn size="lg" onClick={requireAuth(() => setMsgOpen(true))}>Message {firstName}</Btn>
        <Btn size="lg" variant="ghost" onClick={requireAuth(() => setOrderOpen(true))}>Request this piece</Btn>
      </div>

      <ContactModal open={msgOpen} onClose={() => setMsgOpen(false)} creator={creator} product={product} />
      <OrderModal open={orderOpen} onClose={() => setOrderOpen(false)} creator={creator} product={product} />
    </>
  );
}

function ContactModal({ open, onClose, creator, product }: { open: boolean; onClose: () => void; creator: Profile; product: Product }) {
  const router = useRouter();
  const [text, setText] = useState(`Hi ${creator.display_name.split(" ")[0]}, I'm interested in "${product.title}". `);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const send = async () => {
    if (!text.trim()) return;
    setBusy(true); setErr("");
    const conv = await openConversation(creator.id, product.id);
    if (conv.error || !conv.id) { setBusy(false); setErr(conv.error || "Could not start conversation."); return; }
    const m = await sendMessage(conv.id, text);
    setBusy(false);
    if (m.error) { setErr(m.error); return; }
    onClose(); router.push(`/messages?c=${conv.id}`);
  };
  return (
    <Modal open={open} onClose={onClose} title={`Message ${creator.display_name}`}>
      <p style={{ color: MUTE, fontSize: 13.5, marginTop: 0, lineHeight: 1.5 }}>Ask about availability, custom colors, timelines or shipping. You'll continue the conversation in your inbox.</p>
      <Field label="Your message" error={err}><Area value={text} onChange={(e) => setText(e.target.value)} autoFocus /></Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose} disabled={busy}>Cancel</Btn>
        <Btn onClick={send} disabled={busy || !text.trim()}>{busy ? <Spinner /> : "Send message"}</Btn>
      </div>
    </Modal>
  );
}

function OrderModal({ open, onClose, creator, product }: { open: boolean; onClose: () => void; creator: Profile; product: Product }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async () => {
    setBusy(true); setErr("");
    const r = await createOrder(creator.id, product.id, note);
    if (r.error) { setBusy(false); setErr(r.error); return; }
    // also open a conversation so buyer & creator can talk about the request
    const conv = await openConversation(creator.id, product.id);
    if (conv.id) await sendMessage(conv.id, `I'd like to request "${product.title}".${note ? " " + note : ""}`);
    setBusy(false);
    onClose(); router.push("/orders");
  };
  return (
    <Modal open={open} onClose={onClose} title="Request this piece">
      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, background: PANEL2, borderRadius: 12, marginBottom: 16 }}>
        <div style={{ width: 56 }}><Mini seed={product.id} palIndex={stylePalIndex(product.id)} ratio="1 / 1" /></div>
        <div><div style={{ fontWeight: 600 }}>{product.title}</div><div style={{ color: MUTE, fontSize: 13 }}>by {creator.display_name} · ${Number(product.price).toFixed(0)}</div></div>
      </div>
      <p style={{ color: MUTE, fontSize: 13.5, marginTop: 0, lineHeight: 1.5 }}>Realm doesn't process payment. Requesting opens an order so you and the creator can track it — you'll settle price and shipping in chat.</p>
      <Field label="Note for the creator (optional)" error={err}><Area value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any custom requests, deadline, shipping country…" /></Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="ghost" onClick={onClose} disabled={busy}>Cancel</Btn>
        <Btn onClick={submit} disabled={busy}>{busy ? <Spinner /> : "Send request"}</Btn>
      </div>
    </Modal>
  );
}
