"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Btn, Input, Empty } from "@/components/controls";
import { Avatar, Badge, LINE, ACCENT, INK, PANEL, PANEL2, MUTE, TEXT, stylePalIndex } from "@/components/ui";
import { sendMessage, markRead } from "@/app/actions/messaging";
import type { Conversation, Message, Profile } from "@/types/db";

export function MessagesClient({ me, conversations, initialMessages, profiles, activeId }: {
  me: Profile; conversations: Conversation[]; initialMessages: Message[]; profiles: Profile[];
  activeId: string | null;
  supabaseUrl: string; supabaseAnonKey: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [active, setActive] = useState<string | null>(activeId || conversations[0]?.id || null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const other = (c: Conversation) => profiles.find((p) => p.id === (c.buyer_id === me.id ? c.creator_id : c.buyer_id));
  const activeConv = conversations.find((c) => c.id === active);
  const activeOther = activeConv ? other(activeConv) : null;
  const thread = messages.filter((m) => m.conversation_id === active).sort((a, b) => a.created_at.localeCompare(b.created_at));

  // Realtime: subscribe to new messages in the user's conversations
  useEffect(() => {
    const convIds = conversations.map((c) => c.id);
    if (!convIds.length) return;
    const channel = supabase
      .channel("messages-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new as Message;
        if (!convIds.includes(m.conversation_id)) return;
        setMessages((prev) => prev.some((x) => x.id === m.id) ? prev : [...prev, m]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, conversations]);

  // Auto-scroll + mark read on active change / new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    if (active) markRead(active);
  }, [active, thread.length]);

  const send = async () => {
    if (!draft.trim() || !active) return;
    const text = draft.trim();
    setDraft(""); setSending(true);
    // optimistic
    const optimistic: Message = { id: `tmp-${Date.now()}`, conversation_id: active, sender_id: me.id, content: text, is_read: false, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    await sendMessage(active, text);
    setSending(false);
  };

  const openConv = (id: string) => { setActive(id); router.replace(`/messages?c=${id}`); };

  if (conversations.length === 0) {
    return <Empty title="No messages yet" body="When you contact a creator (or a buyer contacts you), your conversations show up here." />;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, height: "70vh", border: `1px solid ${LINE}`, borderRadius: 18, overflow: "hidden" }} className="msg-grid">
      {/* conversation list */}
      <div style={{ borderRight: `1px solid ${LINE}`, overflowY: "auto", background: PANEL }} className="msg-list">
        {conversations.map((c) => {
          const o = other(c);
          const last = messages.filter((m) => m.conversation_id === c.id).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
          const unread = messages.some((m) => m.conversation_id === c.id && m.sender_id !== me.id && !m.is_read);
          return (
            <button key={c.id} onClick={() => openConv(c.id)} style={{ width: "100%", textAlign: "left", display: "flex", gap: 10, alignItems: "center", padding: "12px 14px", background: active === c.id ? PANEL2 : "transparent", border: "none", borderBottom: `1px solid ${LINE}`, cursor: "pointer" }}>
              <Avatar name={o?.display_name || "?"} palIndex={stylePalIndex(o?.id || "")} url={o?.avatar_url} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: TEXT }}>{o?.display_name}</span>
                  {unread && <span style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT }} />}
                </div>
                <div style={{ color: MUTE, fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{last?.content || "No messages yet"}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* thread */}
      <div style={{ display: "flex", flexDirection: "column", background: INK }}>
        {activeOther && (
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${LINE}`, display: "flex", gap: 10, alignItems: "center", background: PANEL }}>
            <Avatar name={activeOther.display_name} palIndex={stylePalIndex(activeOther.id)} url={activeOther.avatar_url} size={32} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{activeOther.display_name}</div>
              <Badge tone={activeOther.role === "creator" ? "accent" : "blue"}>{activeOther.role}</Badge>
            </div>
          </div>
        )}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {thread.map((m) => {
            const mine = m.sender_id === me.id;
            return (
              <div key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "72%", background: mine ? ACCENT : PANEL2, color: mine ? INK : TEXT, padding: "9px 13px", borderRadius: 14, borderBottomRightRadius: mine ? 4 : 14, borderBottomLeftRadius: mine ? 14 : 4, fontSize: 14, lineHeight: 1.5 }}>
                {m.content}
              </div>
            );
          })}
        </div>
        <div style={{ padding: 12, borderTop: `1px solid ${LINE}`, display: "flex", gap: 8, background: PANEL }}>
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="Write a message…" aria-label="Message" />
          <Btn onClick={send} disabled={sending || !draft.trim()}>Send</Btn>
        </div>
      </div>
      <style>{`@media (max-width:720px){ .msg-grid{ grid-template-columns:1fr!important; height:auto!important } }`}</style>
    </div>
  );
}
