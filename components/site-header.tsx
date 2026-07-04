"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogoMark, Avatar, Badge, LINE, ACCENT, ACCENT2, INK, PANEL, PANEL2, TEXT, MUTE, stylePalIndex } from "./ui";
import { Btn } from "./controls";
import { signOut, becomeCreator } from "@/app/actions/auth";
import type { Profile } from "@/types/db";

const NAV = [
  { label: "Catalog", href: "/catalog" },
  { label: "Creators", href: "/creators" },
  { label: "About", href: "/about" },
];

export function SiteHeader({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false); };
    document.addEventListener("mousedown", on);
    return () => document.removeEventListener("mousedown", on);
  }, []);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(16,13,10,.82)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${LINE}` }}>
      <div className="container" style={{ height: 64, display: "flex", alignItems: "center", gap: 24 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LogoMark size={26} />
          <span className="serif" style={{ fontSize: 21, fontWeight: 700, letterSpacing: ".08em" }}>REALM</span>
        </Link>
        <nav style={{ display: "flex", gap: 4, marginLeft: 8 }} className="desk-nav">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href));
            return <Link key={n.href} href={n.href} style={{ padding: "8px 12px", borderRadius: 8, color: active ? ACCENT2 : TEXT, fontWeight: 500, fontSize: 14.5, background: active ? "rgba(157,92,255,.08)" : "transparent" }}>{n.label}</Link>;
          })}
        </nav>
        <div style={{ flex: 1 }} />
        {profile ? (
          <>
            <Link href="/messages" aria-label="Messages" style={{ color: TEXT, display: "flex", padding: 8 }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>
            </Link>
            <div style={{ position: "relative" }} ref={ref}>
              <button onClick={() => setMenu((v) => !v)} aria-haspopup="menu" aria-expanded={menu} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <Avatar name={profile.display_name} palIndex={stylePalIndex(profile.id)} url={profile.avatar_url} size={34} />
              </button>
              {menu && (
                <div role="menu" className="fade" style={{ position: "absolute", right: 0, top: 44, width: 230, background: PANEL, border: `1px solid ${LINE}`, borderRadius: 14, padding: 8, boxShadow: "0 24px 60px -20px rgba(0,0,0,.7)" }}>
                  <div style={{ padding: "8px 10px 10px", borderBottom: `1px solid ${LINE}`, marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.display_name}</div>
                    <div style={{ marginTop: 4 }}><Badge tone={profile.role === "creator" ? "accent" : profile.role === "admin" ? "red" : "blue"}>{profile.role}</Badge></div>
                  </div>
                  {profile.role === "creator" && <MenuLink href="/dashboard" onClick={() => setMenu(false)}>Creator dashboard</MenuLink>}
                  <MenuLink href="/orders" onClick={() => setMenu(false)}>Your orders</MenuLink>
                  <MenuLink href="/settings" onClick={() => setMenu(false)}>Profile & settings</MenuLink>
                  {profile.role === "admin" && <MenuLink href="/admin" onClick={() => setMenu(false)}>Admin</MenuLink>}
                  {profile.role === "buyer" && (
                    <button role="menuitem" onClick={async () => { await becomeCreator(); setMenu(false); router.push("/dashboard"); }} style={{ ...menuItem, color: ACCENT2 }}>Become a creator</button>
                  )}
                  <div style={{ borderTop: `1px solid ${LINE}`, marginTop: 6, paddingTop: 6 }}>
                    <button role="menuitem" onClick={() => signOut()} style={{ ...menuItem, color: MUTE }}>Sign out</button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/login"><Btn variant="ghost" size="sm">Sign in</Btn></Link>
            <Link href="/login?mode=register"><Btn size="sm">Join Realm</Btn></Link>
          </div>
        )}
        <button className="mob-btn" onClick={() => setMobile((v) => !v)} aria-label="Menu" style={{ display: "none", background: PANEL2, border: `1px solid ${LINE}`, color: TEXT, width: 38, height: 38, borderRadius: 10, cursor: "pointer" }}>≡</button>
      </div>
      {mobile && (
        <div className="fade" style={{ borderTop: `1px solid ${LINE}`, padding: 12, background: PANEL }}>
          {NAV.map((n) => <Link key={n.href} href={n.href} onClick={() => setMobile(false)} style={{ display: "block", padding: "10px 12px", color: TEXT, borderRadius: 8 }}>{n.label}</Link>)}
        </div>
      )}
      <style>{`@media (max-width:760px){ .desk-nav{display:none!important} .mob-btn{display:block!important} }`}</style>
    </header>
  );
}

const menuItem: React.CSSProperties = { display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: TEXT, padding: "9px 10px", borderRadius: 8, cursor: "pointer", fontSize: 14 };
function MenuLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return <Link role="menuitem" href={href} onClick={onClick} style={menuItem}>{children}</Link>;
}
