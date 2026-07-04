// Shared presentational primitives. Server-safe (no client hooks here).
import React from "react";

export const ACCENT = "#9d5cff", ACCENT2 = "#c9a5ff", INK = "#100d0a",
  PANEL = "#191510", PANEL2 = "#221c15", LINE = "rgba(157,92,255,0.18)",
  TEXT = "#ece4d8", MUTE = "#9a8d79";

export const PALS: [string, string, string][] = [
  ["#2b2118", "#c98a3a", "#ffcaa0"],
  ["#1d2630", "#5e8ca8", "#bfe4ff"],
  ["#251a26", "#9a5ea8", "#e9c6ff"],
  ["#202a22", "#5ca87a", "#c6ffd9"],
  ["#2a1c1c", "#bf5b4a", "#ffc6bb"],
  ["#23232b", "#8a8ab0", "#d6d6ff"],
];

export function LogoMark({ size = 28, color = ACCENT }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 734.69 698.93" aria-hidden="true" style={{ display: "block" }}>
      <g fill={color}>
        <path d="M46.03,232.98c18.72,0,34.84-11.47,42.03-27.94,2.02-4.63,7.87-5.9,11.56-2.53,13.16,12.04,30.5,19.37,49.5,19.44,41.41.15,74.98-34.07,75.11-76.57.05-15.7-4.5-30.3-12.33-42.49-2.61-4.07-.85-9.58,3.6-11.25,17.66-6.61,30.27-23.99,30.27-44.4C245.78,21.64,225.92.79,201.15.02c-.19,0-.38-.01-.57-.01-.28,0-.56,0-.84,0s-.56,0-.84,0H0v185.72c0,.62.01,1.24.04,1.86.95,25.23,21.18,45.39,46,45.39Z"/>
        <path d="M96.77,465.26c-53.45,0-96.77,52.31-96.77,116.84s43.33,116.84,96.77,116.84,96.77-60.26,96.77-124.79-43.33-108.89-96.77-108.89Z"/>
        <path d="M313.61,369.39s129.48-52.46,129.53-52.47c51.26-20.45,45.74-68.59,45.91-75.48.44-18.33.25-117.55.25-120.21L0,327l474.12,371.93h260.58l-421.08-329.55Z"/>
      </g>
    </svg>
  );
}

// Deterministic procedural "miniature" — same generator as the runnable app,
// used as a placeholder until real product photos are uploaded to Storage.
export function miniArt(seed: string, pal: [string, string, string]): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const r = (n: number) => { h = (h * 1103515245 + 12345) >>> 0; return h % n; };
  const [base, accent, glow] = pal;
  const cx = 100, gy = 168, bodyW = 38 + r(22), headR = 13 + r(8), armLen = 30 + r(20);
  const cape = r(2) === 0, staff = r(2) === 0, wings = r(3) === 0, tilt = r(14) - 7;
  return `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Miniature">
    <defs><radialGradient id="g_${seed}" cx="50%" cy="35%" r="75%"><stop offset="0%" stop-color="${glow}" stop-opacity="0.5"/><stop offset="60%" stop-color="${base}" stop-opacity="0.05"/><stop offset="100%" stop-color="${base}" stop-opacity="0"/></radialGradient>
    <linearGradient id="b_${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${accent}"/><stop offset="100%" stop-color="${base}"/></linearGradient></defs>
    <rect width="200" height="220" fill="url(#g_${seed})"/>
    <ellipse cx="${cx}" cy="${gy+22}" rx="46" ry="11" fill="#000" opacity="0.35"/>
    <ellipse cx="${cx}" cy="${gy+20}" rx="44" ry="9" fill="${accent}" opacity="0.18"/>
    <g transform="rotate(${tilt} ${cx} ${gy})">
      ${wings ? `<path d="M${cx} ${gy-40} q-60 -30 -54 30 q30 -22 54 -8 q24 -14 54 8 q6 -60 -54 -30Z" fill="${accent}" opacity="0.35"/>` : ""}
      ${cape ? `<path d="M${cx-bodyW/2} ${gy-44} q-26 50 -10 78 l${bodyW+20} 0 q16 -28 -10 -78Z" fill="${base}" opacity="0.9"/>` : ""}
      <rect x="${cx-bodyW/2}" y="${gy-46}" width="${bodyW}" height="64" rx="${bodyW/3}" fill="url(#b_${seed})"/>
      <line x1="${cx-bodyW/2}" y1="${gy-36}" x2="${cx-bodyW/2-armLen}" y2="${gy-20+r(30)}" stroke="${accent}" stroke-width="9" stroke-linecap="round"/>
      <line x1="${cx+bodyW/2}" y1="${gy-36}" x2="${cx+bodyW/2+armLen}" y2="${gy-20+r(30)}" stroke="${accent}" stroke-width="9" stroke-linecap="round"/>
      ${staff ? `<line x1="${cx+bodyW/2+armLen}" y1="${gy-60}" x2="${cx+bodyW/2+armLen}" y2="${gy+30}" stroke="${glow}" stroke-width="4"/><circle cx="${cx+bodyW/2+armLen}" cy="${gy-62}" r="7" fill="${glow}"/>` : ""}
      <circle cx="${cx}" cy="${gy-58}" r="${headR}" fill="${accent}"/>
      <path d="M${cx-headR} ${gy-62} q${headR} -${headR*1.4} ${headR*2} 0 q-${headR} -4 -${headR*2} 0Z" fill="${base}"/>
    </g></svg>`;
}

export function Mini({ seed, palIndex = 0, ratio = "4 / 5", url }: { seed: string; palIndex?: number; ratio?: string; url?: string | null }) {
  const pal = PALS[palIndex % PALS.length];
  if (url) {
    return <div style={{ aspectRatio: ratio, width: "100%", borderRadius: 12, overflow: "hidden", background: INK }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>;
  }
  return <div style={{ aspectRatio: ratio, width: "100%", background: `radial-gradient(120% 90% at 50% 25%, ${pal[0]}, ${INK})`, borderRadius: 12, overflow: "hidden", display: "flex" }}
    dangerouslySetInnerHTML={{ __html: miniArt(seed, pal) }} />;
}

export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "accent" | "green" | "blue" | "red" | "grey" }) {
  const tones: Record<string, [string, string, string]> = {
    default: [PANEL2, MUTE, LINE],
    accent: ["rgba(157,92,255,.14)", ACCENT2, "rgba(157,92,255,.35)"],
    green: ["rgba(92,168,122,.14)", "#86d6a3", "rgba(92,168,122,.35)"],
    blue: ["rgba(94,140,168,.14)", "#9bc4e0", "rgba(94,140,168,.35)"],
    red: ["rgba(224,138,122,.12)", "#e3a294", "rgba(224,138,122,.3)"],
    grey: ["rgba(154,141,121,.12)", MUTE, LINE],
  };
  const [bg, c, b] = tones[tone] || tones.default;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: bg, color: c, border: `1px solid ${b}`, textTransform: "capitalize" }}>{children}</span>;
}

export function Avatar({ name, palIndex = 0, url, size = 40 }: { name: string; palIndex?: number; url?: string | null; size?: number }) {
  const pal = PALS[palIndex % PALS.length];
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  if (url) return <img src={url} alt="" width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover", border: `1px solid ${LINE}` }} />;
  return <div aria-hidden style={{ width: size, height: size, minWidth: size, borderRadius: "50%", background: `linear-gradient(135deg, ${pal[1]}, ${pal[0]})`, display: "flex", alignItems: "center", justifyContent: "center", color: pal[2], fontWeight: 700, fontSize: size * 0.36, border: `1px solid ${LINE}` }}>{initials}</div>;
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return <span style={{ display: "inline-flex", gap: 2 }} aria-label={`${value.toFixed(1)} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => {
      const filled = value >= n - 0.25, half = !filled && value >= n - 0.75;
      return <svg key={n} width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
        <defs><linearGradient id={`s${n}`}><stop offset="50%" stopColor={ACCENT2}/><stop offset="50%" stopColor="#3a3022"/></linearGradient></defs>
        <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5 20.4l1.4-6.8L1.3 9l6.9-.7z" fill={filled ? ACCENT2 : half ? `url(#s${n})` : "#3a3022"} />
      </svg>;
    })}
  </span>;
}

export const stylePalIndex = (id: string) => {
  let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % PALS.length;
};
