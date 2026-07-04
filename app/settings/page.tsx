import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { SettingsClient } from "./client";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const me = await getCurrentProfile();
  if (!me) redirect("/login?next=/settings");
  return (
    <div className="fade" style={{ paddingTop: 32, maxWidth: 620 }}>
      <h1 className="serif" style={{ fontSize: 28, margin: "0 0 6px" }}>Profile & settings</h1>
      <p style={{ color: "var(--mute)", margin: "0 0 24px" }}>This is how buyers and creators see you across Realm.</p>
      <SettingsClient me={me} />
    </div>
  );
}
