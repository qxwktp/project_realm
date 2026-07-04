"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Area, Field, Spinner } from "@/components/controls";
import { Modal } from "@/components/modal";
import { MUTE } from "@/components/ui";
import { openConversation, sendMessage } from "@/app/actions/messaging";

export function MessageButton({ creatorId, signedIn }: { creatorId: string; signedIn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onClick = () => { if (!signedIn) { router.push("/login"); return; } setOpen(true); };
  const send = async () => {
    if (!text.trim()) return;
    setBusy(true); setErr("");
    const conv = await openConversation(creatorId, null);
    if (conv.error || !conv.id) { setBusy(false); setErr(conv.error || "Could not start conversation."); return; }
    const m = await sendMessage(conv.id, text);
    setBusy(false);
    if (m.error) { setErr(m.error); return; }
    setOpen(false); router.push(`/messages?c=${conv.id}`);
  };

  return (
    <>
      <Btn onClick={onClick}>Message</Btn>
      <Modal open={open} onClose={() => setOpen(false)} title="Send a message">
        <p style={{ color: MUTE, fontSize: 13.5, marginTop: 0 }}>Start a conversation with this creator about commissions, availability or custom work.</p>
        <Field label="Your message" error={err}><Area value={text} onChange={(e) => setText(e.target.value)} placeholder="What would you like to ask?" autoFocus /></Field>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</Btn>
          <Btn onClick={send} disabled={busy || !text.trim()}>{busy ? <Spinner /> : "Send message"}</Btn>
        </div>
      </Modal>
    </>
  );
}
