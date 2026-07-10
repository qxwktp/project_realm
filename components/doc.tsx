import React from "react";
import { LINE, MUTE, TEXT, ACCENT2, PANEL } from "@/components/ui";

export function DocShell({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className="fade" style={{ paddingTop: 40, maxWidth: 760 }}>
      <h1 className="serif" style={{ fontSize: 34, margin: "0 0 10px" }}>{title}</h1>
      {intro && <p style={{ color: MUTE, fontSize: 17, lineHeight: 1.6, margin: "0 0 28px" }}>{intro}</p>}
      {children}
    </div>
  );
}

export function DocSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 30 }}>
      <h2 className="serif" style={{ fontSize: 22, margin: "0 0 12px" }}>{heading}</h2>
      <div style={{ color: TEXT, fontSize: 15.5, lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

// A Q&A block used across FAQ / Shipping / Trust pages.
export function QA({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${LINE}` }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px", color: ACCENT2 }}>{q}</h3>
      <div style={{ color: TEXT, fontSize: 15, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

// Renders bracketed "needs a decision" placeholders visibly but unobtrusively.
export function Placeholder({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#e0b57a", fontStyle: "italic" }}>[{children}]</span>;
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul style={{ margin: "0 0 8px", paddingLeft: 20, color: TEXT, lineHeight: 1.7 }}>
      {items.map((it, i) => <li key={i} style={{ marginBottom: 6 }}>{it}</li>)}
    </ul>
  );
}
