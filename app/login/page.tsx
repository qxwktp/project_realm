"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Btn, Input, Field, Spinner } from "@/components/controls";
import { LogoMark, LINE, ACCENT, ACCENT2, MUTE, PANEL, PANEL2, TEXT, INK } from "@/components/ui";
import { signIn, signUp, requestPasswordReset } from "@/app/actions/auth";

type View = "login" | "register" | "forgot" | "verify";

function LoginInner() {
  const params = useSearchParams();
  const router = useRouter();
  const next = params.get("next") || "/catalog";
  const [view, setView] = useState<View>(params.get("mode") === "register" ? "register" : "login");
  const [form, setForm] = useState({ email: "", password: "", display_name: "", username: "", role: "buyer" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr(""); setBusy(true);
    if (view === "login") {
      const fd = new FormData();
      fd.set("email", form.email); fd.set("password", form.password); fd.set("next", next);
      const r = await signIn(fd);
      setBusy(false);
      if (r?.error) setErr(r.error);
    } else if (view === "register") {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.set(k, v));
      const r = await signUp(fd);
      setBusy(false);
      if (r?.error) setErr(r.error); else setView("verify");
    } else if (view === "forgot") {
      const fd = new FormData(); fd.set("email", form.email);
      await requestPasswordReset(fd);
      setBusy(false);
      setView("login");
      setErr("");
      alert("If that email exists, a reset link is on its way.");
    }
  };

  return (
    <div style={{ maxWidth: 440, margin: "60px auto 0", padding: "0 20px" }} className="fade">
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}><LogoMark size={40} /></div>
      <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 18, padding: 24 }}>
        <h1 className="serif" style={{ fontSize: 22, margin: "0 0 18px", textAlign: "center" }}>
          {view === "login" ? "Welcome back" : view === "register" ? "Join Realm" : view === "verify" ? "Check your inbox" : "Reset password"}
        </h1>

        {view === "verify" ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 34, marginBottom: 12 }}>✉</div>
            <p style={{ color: TEXT, lineHeight: 1.6 }}>We sent a verification link to <strong>{form.email}</strong>. Click it to confirm your account, then sign in.</p>
            <Btn full onClick={() => setView("login")}>Back to sign in</Btn>
          </div>
        ) : (
          <>
            {view === "register" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[["buyer", "Buy minis", "Browse & commission"], ["creator", "Sell my work", "Open a studio"]].map(([role, t, s]) => (
                  <button key={role} onClick={() => setForm({ ...form, role })} style={{ textAlign: "left", padding: 14, borderRadius: 12, cursor: "pointer", background: form.role === role ? "rgba(157,92,255,.1)" : PANEL2, border: `1px solid ${form.role === role ? ACCENT : LINE}` }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t}</div>
                    <div style={{ color: MUTE, fontSize: 12, marginTop: 2 }}>{s}</div>
                  </button>
                ))}
              </div>
            )}
            {view === "register" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Display name"><Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Your name" /></Field>
                <Field label="Username"><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="handle" /></Field>
              </div>
            )}
            <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" /></Field>
            {view !== "forgot" && <Field label="Password" hint={view === "register" ? "At least 8 characters." : undefined}><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="••••••••" /></Field>}
            {err && <div style={{ background: "rgba(224,138,122,.12)", border: "1px solid rgba(224,138,122,.3)", color: "#e3a294", padding: "9px 12px", borderRadius: 10, fontSize: 13.5, marginBottom: 14 }}>{err}</div>}
            <Btn full onClick={submit} disabled={busy}>{busy ? <Spinner /> : view === "login" ? "Sign in" : view === "register" ? "Create account" : "Send reset link"}</Btn>

            <div style={{ marginTop: 16, textAlign: "center", fontSize: 13.5, color: MUTE }}>
              {view === "login" && <>New here? <span className="link" onClick={() => setView("register")}>Create an account</span><div style={{ marginTop: 6 }}><span className="link" onClick={() => setView("forgot")}>Forgot password?</span></div></>}
              {view === "register" && <>Already have an account? <span className="link" onClick={() => setView("login")}>Sign in</span></>}
              {view === "forgot" && <span className="link" onClick={() => setView("login")}>← Back to sign in</span>}
            </div>
          </>
        )}
      </div>
      <p style={{ textAlign: "center", color: MUTE, fontSize: 12.5, marginTop: 16 }}>
        <Link href="/" className="link">← Back to Realm</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginInner /></Suspense>;
}
