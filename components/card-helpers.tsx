// Re-export server-safe primitives + a public-URL helper for storage paths.
export { Mini, Avatar, Badge, Stars, LogoMark, PALS, stylePalIndex,
  ACCENT, ACCENT2, INK, PANEL, PANEL2, LINE, TEXT, MUTE } from "./ui";

export function publicUrlSafe(bucket: string, path?: string | null): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
