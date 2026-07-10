"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Select, Area, Field, Spinner } from "@/components/controls";
import { Modal } from "@/components/modal";
import { MUTE } from "@/components/ui";
import { reportListing } from "@/app/actions/products";

const REASONS = [
  "Intellectual property / copyright concern",
  "Counterfeit or misrepresented item",
  "Prohibited or unsafe content",
  "Spam or scam",
  "Other",
];

export function ReportButton({ productId, signedIn }: { productId: string; signedIn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const onClick = () => { if (!signedIn) { router.push(`/login?next=/product/${productId}`); return; } setOpen(true); };
  const submit = async () => {
    setBusy(true); setErr("");
    const r = await reportListing(productId, reason, details);
    setBusy(false);
    if (r.error) { setErr(r.error); return; }
    setDone(true);
  };

  return (
    <>
      <button onClick={onClick} style={{ background: "none", border: "none", color: MUTE, fontSize: 12.5, cursor: "pointer", textDecoration: "underline" }}>
        Report this listing
      </button>
      <Modal open={open} onClose={() => { setOpen(false); setDone(false); }} title="Report this listing">
        {done ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>✓</div>
            <p style={{ color: MUTE }}>Thanks — this has been sent to our review queue.</p>
            <Btn onClick={() => { setOpen(false); setDone(false); }}>Close</Btn>
          </div>
        ) : (
          <>
            <p style={{ color: MUTE, fontSize: 13.5, marginTop: 0 }}>Reports go to Realm's content and IP review team. Give us as much detail as you can.</p>
            <Field label="Reason"><Select value={reason} onChange={(e) => setReason(e.target.value)}>{REASONS.map((r) => <option key={r} value={r}>{r}</option>)}</Select></Field>
            <Field label="Details (optional)" error={err}><Area value={details} onChange={(e) => setDetails(e.target.value)} placeholder="What's the issue? Include links or rights-holder info if relevant." /></Field>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Btn variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</Btn>
              <Btn onClick={submit} disabled={busy}>{busy ? <Spinner /> : "Submit report"}</Btn>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
