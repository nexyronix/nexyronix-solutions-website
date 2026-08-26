/**
 * Rendered instead of the Canvas when the user prefers reduced motion or
 * their browser can't do WebGL. No animation, no 3D — just enough visual
 * weight that the hero doesn't feel broken, and the text stays fully usable.
 */
export function HeroFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <div
        className="relative h-[42vw] max-h-[520px] w-[42vw] max-w-[520px] min-h-[280px] min-w-[280px] rounded-full border border-border-strong/60"
        style={{
          boxShadow: "0 0 120px 40px rgba(46,124,246,0.10), inset 0 0 80px rgba(69,224,232,0.06)",
        }}
      >
        <div className="absolute inset-8 rounded-full border border-border/60" />
        <div className="absolute inset-16 rounded-full border border-border/40" />
      </div>
    </div>
  );
}
