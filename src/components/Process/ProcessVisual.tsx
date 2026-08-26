import { cn } from "@/lib/cn";

interface ProcessVisualProps {
  /** 0 = Discover ... 5 = Evolve */
  stageIndex: number;
  size?: "lg" | "sm";
}

const CYAN = "#45e0e8";
const PRIMARY = "#2e7cf6";
const VIOLET = "#7c6fe8";
const BORDER = "#242d3d";

const TRIANGLE: [number, number][] = [
  [60, 32],
  [40, 74],
  [80, 74],
];

const FADE = "transition-opacity duration-500 ease-signature";

/**
 * The same abstract object throughout — an idea core that gains a frame,
 * then components, is checked, then wrapped in a larger environment, then
 * grows new satellite nodes. Layers are cumulative except the Test-stage
 * scan ring, which is transient.
 */
export function ProcessVisual({ stageIndex, size = "lg" }: ProcessVisualProps) {
  const dim = size === "lg" ? 160 : 72;
  const showRings = stageIndex === 0;
  const showFrame = stageIndex >= 1;
  const showSquares = stageIndex >= 2;
  const showScan = stageIndex === 3;
  const showOuter = stageIndex >= 4;
  const showSatellites = stageIndex >= 5;

  return (
    <svg viewBox="0 0 120 120" width={dim} height={dim} fill="none" aria-hidden="true">
      {/* Discover — searching rings */}
      <g className={cn(FADE, showRings ? "opacity-100" : "opacity-0")}>
        <circle cx="60" cy="60" r="14" stroke={BORDER} />
        <circle cx="60" cy="60" r="22" stroke={BORDER} className="animate-pulse-slow" />
      </g>

      {/* Design+ — structural frame */}
      <g className={cn(FADE, showFrame ? "opacity-100" : "opacity-0")}>
        {TRIANGLE.map((p, i) => {
          const next = TRIANGLE[(i + 1) % TRIANGLE.length];
          return (
            <line key={i} x1={p[0]} y1={p[1]} x2={next[0]} y2={next[1]} stroke={PRIMARY} strokeOpacity="0.5" />
          );
        })}
      </g>

      {/* Develop+ — components attached to the frame */}
      <g className={cn(FADE, showSquares ? "opacity-100" : "opacity-0")}>
        {TRIANGLE.map((p, i) => (
          <rect
            key={i}
            x={p[0] - 4}
            y={p[1] - 4}
            width="8"
            height="8"
            rx="1.5"
            fill="#0d1119"
            stroke={CYAN}
            strokeOpacity="0.75"
          />
        ))}
      </g>

      {/* Test only — a scanning ring, checking the structure */}
      {showScan && (
        <g style={{ transformOrigin: "60px 60px" }} className="animate-spin">
          <path d="M60 30a30 30 0 0 1 21.2 8.8" stroke={CYAN} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}

      {/* Deploy+ — a larger environment forms around it */}
      <g className={cn(FADE, showOuter ? "opacity-100" : "opacity-0")}>
        <circle cx="60" cy="60" r="44" stroke={BORDER} strokeDasharray="2 4" />
        <line x1="60" y1="10" x2="60" y2="16" stroke={PRIMARY} strokeOpacity="0.6" />
        <line x1="60" y1="104" x2="60" y2="110" stroke={PRIMARY} strokeOpacity="0.6" />
        <line x1="10" y1="60" x2="16" y2="60" stroke={PRIMARY} strokeOpacity="0.6" />
        <line x1="104" y1="60" x2="110" y2="60" stroke={PRIMARY} strokeOpacity="0.6" />
      </g>

      {/* Evolve — new nodes begin forming */}
      <g className={cn(FADE, showSatellites ? "opacity-100" : "opacity-0")}>
        <line x1="60" y1="60" x2="94" y2="40" stroke={VIOLET} strokeOpacity="0.4" />
        <line x1="60" y1="60" x2="30" y2="94" stroke={VIOLET} strokeOpacity="0.4" />
        <circle cx="94" cy="40" r="3" fill={VIOLET} />
        <circle cx="30" cy="94" r="3" fill={CYAN} className="animate-pulse-slow" />
      </g>

      {/* The core — always present */}
      <circle cx="60" cy="60" r="5" fill={CYAN} />
      <circle cx="60" cy="60" r="9" fill={CYAN} fillOpacity="0.12" />
    </svg>
  );
}
