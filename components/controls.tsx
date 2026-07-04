"use client";
import React from "react";
import { ACCENT, ACCENT2, INK, PANEL2, LINE, TEXT, MUTE } from "./ui";

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost" | "soft" | "danger";
  size?: "sm" | "md" | "lg";
  full?: boolean;
};
export function Btn({ children, variant = "solid", size = "md", full, style, ...p }: BtnProps) {
  const pad = { sm: "8px 14px", md: "11px 20px", lg: "15px 28px" }[size];
  const fz = { sm: 13, md: 14, lg: 15 }[size];
  const variants: Record<string, React.CSSProperties> = {
    solid: { background: `linear-gradient(180deg, ${ACCENT2}, ${ACCENT})`, color: INK, boxShadow: "0 6px 20px -8px rgba(157,92,255,.6)" },
    ghost: { background: "transparent", color: TEXT, border: `1px solid ${LINE}` },
    soft: { background: PANEL2, color: TEXT, border: `1px solid ${LINE}` },
    danger: { background: "transparent", color: "#e08a7a", border: "1px solid rgba(224,138,122,.35)" },
  };
  return (
    <button {...p} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      padding: pad, fontSize: fz, fontWeight: 600, borderRadius: 10, border: "1px solid transparent",
      cursor: p.disabled ? "not-allowed" : "pointer", opacity: p.disabled ? 0.55 : 1,
      width: full ? "100%" : undefined, whiteSpace: "nowrap", transition: "all .18s",
      ...variants[variant], ...style,
    }}>{children}</button>
  );
}

export const inputStyle = (err?: boolean): React.CSSProperties => ({
  width: "100%", padding: "11px 13px", background: INK, color: TEXT,
  border: `1px solid ${err ? "#e08a7a" : LINE}`, borderRadius: 10, fontSize: 14, outline: "none",
});

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }>(
  function Input({ error, style, ...p }, ref) { return <input ref={ref} {...p} style={{ ...inputStyle(error), ...style }} />; }
);
export function Area(p: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  const { error, style, ...rest } = p;
  return <textarea {...rest} style={{ ...inputStyle(error), resize: "vertical", minHeight: 96, ...style }} />;
}
export function Select(p: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  const { error, style, ...rest } = p;
  return <select {...rest} style={{ ...inputStyle(error), appearance: "none", cursor: "pointer", ...style }} />;
}

export function Field({ label, hint, error, children }: { label?: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      {label && <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: MUTE, marginBottom: 6 }}>{label}</span>}
      {children}
      {error ? <span style={{ display: "block", color: "#e08a7a", fontSize: 12.5, marginTop: 5 }}>{error}</span>
        : hint ? <span style={{ display: "block", color: MUTE, fontSize: 12, marginTop: 5 }}>{hint}</span> : null}
    </label>
  );
}

export function Spinner({ size = 18 }: { size?: number }) {
  return <span className="spin" style={{ width: size, height: size, border: `2px solid ${LINE}`, borderTopColor: ACCENT2, borderRadius: "50%", display: "inline-block" }} aria-label="Loading" />;
}

export function Empty({ icon = "✦", title, body, action }: { icon?: string; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="fade" style={{ textAlign: "center", padding: "56px 20px", border: `1px dashed ${LINE}`, borderRadius: 16, background: "var(--panel)" }}>
      <div style={{ fontSize: 32, color: ACCENT, marginBottom: 12, opacity: .7 }}>{icon}</div>
      <h3 className="serif" style={{ margin: "0 0 6px", fontSize: 18 }}>{title}</h3>
      <p style={{ color: MUTE, margin: "0 auto 16px", maxWidth: 360, fontSize: 14, lineHeight: 1.55 }}>{body}</p>
      {action}
    </div>
  );
}
