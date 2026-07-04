"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Spinner } from "@/components/controls";
import { becomeCreator } from "@/app/actions/auth";

export function BecomeCreatorButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Btn onClick={async () => { setBusy(true); await becomeCreator(); setBusy(false); router.refresh(); }} disabled={busy}>
      {busy ? <Spinner /> : "Open my studio"}
    </Btn>
  );
}
