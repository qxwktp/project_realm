"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Input, Area, Field, Spinner } from "@/components/controls";
import { Avatar, Badge, LINE, MUTE, PANEL, TEXT, stylePalIndex } from "@/components/ui";
import { updateProfile } from "@/app/actions/auth";
import type { Profile } from "@/types/db";

export function SettingsClient({ me }: { me: Profile }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(me.display_name);
  const [bio, setBio] = useState(me.bio || "");
  const socials = me.socials || {};
  const [instagram, setInstagram] = useState(socials.instagram || "");
  const [twitter, setTwitter] = useState(socials.twitter || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const save = async () => {
    setBusy(true); setMsg("");
    const r = await updateProfile({
      display_name: displayName, bio,
      socials: { ...(instagram ? { instagram } : {}), ...(twitter ? { twitter } : {}) },
    });
    setBusy(false);
    setMsg(r.error ? r.error : "Saved.");
    if (!r.error) router.refresh();
  };

  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, background: PANEL }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 22 }}>
        <Avatar name={me.display_name} palIndex={stylePalIndex(me.id)} url={me.avatar_url} size={60} />
        <div>
          <div style={{ fontWeight: 600 }}>{me.email}</div>
          <div style={{ marginTop: 4 }}><Badge tone={me.role === "creator" ? "accent" : me.role === "admin" ? "red" : "blue"}>{me.role}</Badge></div>
        </div>
      </div>
      <Field label="Display name"><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></Field>
      <Field label="Bio" hint="A sentence or two about you and your work."><Area value={bio} onChange={(e) => setBio(e.target.value)} placeholder="I paint grimdark heroes and tabletop terrain…" /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Instagram (handle)"><Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="username" /></Field>
        <Field label="Twitter / X (handle)"><Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="username" /></Field>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
        <Btn onClick={save} disabled={busy}>{busy ? <Spinner /> : "Save changes"}</Btn>
        {msg && <span style={{ color: msg === "Saved." ? "#86d6a3" : "#e3a294", fontSize: 13.5 }}>{msg}</span>}
      </div>
      <p style={{ color: MUTE, fontSize: 12.5, marginTop: 18 }}>Avatar & image uploads are added once your Supabase Storage buckets are live — the buckets are already created by migration 0003.</p>
    </div>
  );
}
