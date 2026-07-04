import Link from "next/link";
import { LogoMark, MUTE } from "@/components/ui";
import { Btn } from "@/components/controls";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "100px 20px" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, opacity: .6 }}><LogoMark size={54} /></div>
      <h1 className="serif" style={{ fontSize: 32, margin: "0 0 10px" }}>Lost in the Realm</h1>
      <p style={{ color: MUTE, marginBottom: 24 }}>This page doesn't exist — or the piece has been unlisted.</p>
      <Link href="/"><Btn>Back to home</Btn></Link>
    </div>
  );
}
