import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { MessagesClient } from "./client";
import type { Conversation, Message, Profile } from "@/types/db";

export const metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function MessagesPage({ searchParams }: { searchParams: { c?: string } }) {
  const me = await getCurrentProfile();
  if (!me) redirect("/login?next=/messages");
  const supabase = createClient();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .or(`buyer_id.eq.${me.id},creator_id.eq.${me.id}`)
    .order("updated_at", { ascending: false });

  const convIds = (conversations || []).map((c) => c.id);
  const { data: messages } = convIds.length
    ? await supabase.from("messages").select("*").in("conversation_id", convIds).order("created_at")
    : { data: [] as Message[] };

  // counterpart profiles
  const otherIds = Array.from(new Set((conversations || []).map((c) => (c.buyer_id === me.id ? c.creator_id : c.buyer_id))));
  const { data: profiles } = otherIds.length
    ? await supabase.from("profiles").select("id,display_name,avatar_url,username,role,email,bio,socials,created_at,updated_at").in("id", otherIds)
    : { data: [] as Profile[] };

  return (
    <div className="fade" style={{ paddingTop: 24 }}>
      <h1 className="serif" style={{ fontSize: 26, margin: "0 0 16px" }}>Messages</h1>
      <MessagesClient
        me={me}
        conversations={(conversations || []) as Conversation[]}
        initialMessages={(messages || []) as Message[]}
        profiles={(profiles || []) as Profile[]}
        activeId={searchParams.c || null}
        supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
        supabaseAnonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
      />
    </div>
  );
}
