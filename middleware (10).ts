import Link from "next/link";
import { LogoMark, LINE, MUTE } from "./ui";

export function SiteFooter() {
  return (
    <footer style={{ borderTop: `1px solid ${LINE}`, marginTop: 40 }}>
      <div className="container" style={{ padding: "32px 20px", display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LogoMark size={22} />
          <span className="serif" style={{ letterSpacing: ".1em", fontWeight: 700 }}>REALM</span>
          <span style={{ color: MUTE, fontSize: 13, marginLeft: 8 }}>Curated 3D-printed miniatures.</span>
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: 13.5 }}>
          <Link href="/catalog" style={{ color: MUTE }}>Catalog</Link>
          <Link href="/creators" style={{ color: MUTE }}>Creators</Link>
          <Link href="/about" style={{ color: MUTE }}>About</Link>
        </div>
      </div>
    </footer>
  );
}
