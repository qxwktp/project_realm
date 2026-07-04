import Link from "next/link";
import { LogoMark, Badge, ACCENT2, LINE, PANEL, MUTE, TEXT } from "@/components/ui";
import { Btn } from "@/components/controls";

export const metadata = { title: "About", description: "What Realm is and how it works." };

export default function AboutPage() {
  const steps = [
    ["Discover", "Browse a curated catalogue of hand-finished miniatures — no endless clutter, just work worth commissioning."],
    ["Message", "Talk to the creator directly. Ask about colours, scale, timelines and shipping."],
    ["Commission", "Agree the details together. Realm doesn't take a cut or process payment during the MVP — you settle directly."],
    ["Review", "After a creator completes your order, leave a rating so the next buyer can choose with confidence."],
  ];
  return (
    <div className="fade" style={{ paddingTop: 40, maxWidth: 760 }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}><LogoMark size={44} /></div>
      <h1 className="serif" style={{ fontSize: 36, textAlign: "center", margin: "0 0 12px" }}>A place to choose, not to search.</h1>
      <p style={{ textAlign: "center", color: MUTE, fontSize: 18, lineHeight: 1.6, margin: "0 auto 40px", maxWidth: 560 }}>
        Realm connects the painters behind hand-finished 3D-printed miniatures with the players who want them for their table.
      </p>
      <div style={{ display: "grid", gap: 14 }}>
        {steps.map(([t, d], i) => (
          <div key={t} style={{ display: "flex", gap: 16, alignItems: "flex-start", border: `1px solid ${LINE}`, borderRadius: 14, padding: 18, background: PANEL }}>
            <div className="serif" style={{ fontSize: 22, color: ACCENT2, minWidth: 32 }}>{String(i + 1).padStart(2, "0")}</div>
            <div><h3 className="serif" style={{ margin: "0 0 4px", fontSize: 18 }}>{t}</h3><p style={{ margin: 0, color: TEXT, lineHeight: 1.6 }}>{d}</p></div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 36 }}>
        <Link href="/catalog"><Btn size="lg">Explore the catalogue</Btn></Link>
      </div>
    </div>
  );
}
