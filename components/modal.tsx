"use client";
import React, { useEffect } from "react";
import { LINE, PANEL, PANEL2, MUTE } from "./ui";

export function Modal({ open, onClose, title, children, width = 460 }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title} onMouseDown={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(8,6,4,.72)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="fade" onMouseDown={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto", background: PANEL, border: `1px solid ${LINE}`, borderRadius: 18, padding: 24, boxShadow: "0 40px 90px -30px rgba(0,0,0,.8)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 className="serif" style={{ margin: 0, fontSize: 20 }}>{title}</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: PANEL2, border: `1px solid ${LINE}`, color: MUTE, width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
