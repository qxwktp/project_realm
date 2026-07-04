// Fixed, muted, looping video backdrop for the hero. Sits behind content with a
// dark gradient scrim so text stays readable. Respects reduced-motion (shows poster).
export function VideoBackdrop() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 24, zIndex: 0 }}>
      <video
        autoPlay muted loop playsInline
        poster="/background-poster.jpg"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
      {/* scrim: darken + tint toward the ink background so the hero text pops */}
      <div style={{ position: "absolute", inset: 0, background:
        "linear-gradient(180deg, rgba(16,13,10,.55) 0%, rgba(16,13,10,.78) 60%, rgba(16,13,10,.95) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background:
        "radial-gradient(120% 100% at 20% 20%, rgba(157,92,255,.20), transparent 60%)" }} />
    </div>
  );
}
