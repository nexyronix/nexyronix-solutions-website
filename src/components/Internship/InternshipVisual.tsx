import { cn } from "@/lib/cn";

const CYAN = "#45e0e8";
const PRIMARY = "#2e7cf6";
const BORDER = "#242d3d";

const WAYPOINTS = [
  { x: 150, label: "LEARN" },
  { x: 280, label: "BUILD" },
  { x: 410, label: "EXPERIENCE" },
  { x: 540, label: "GROW" },
];

const FLOATING = [
  { x: 200, y: 40, label: "SOLVE" },
  { x: 350, y: 170, label: "COLLABORATE" },
  { x: 480, y: 46, label: "SHIP" },
];

const PATH = "M40 110 C 110 60, 190 160, 280 110 S 460 60, 620 110";

/**
 * A single lightweight SVG pathway — deliberately not another Three.js scene
 * (the brief warns against a second heavy 3D scene, and the Hero + Technology
 * Universe already own that budget). Motion comes from CSS on a handful of
 * elements, so it stays cheap on mobile.
 */
export function InternshipVisual({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 660 220"
      width="100%"
      height="100%"
      fill="none"
      className={cn("max-w-full", className)}
      aria-hidden="true"
    >
      {/* Base path */}
      <path d={PATH} stroke={BORDER} strokeWidth="1.5" />
      {/* Lit overlay, flowing forward */}
      <path
        d={PATH}
        stroke={CYAN}
        strokeWidth="1.5"
        strokeOpacity="0.55"
        strokeDasharray="6 10"
        className="animate-dash-flow"
      />

      {/* Origin — STUDENT */}
      <circle cx="40" cy="110" r="7" fill="#0d1119" stroke={PRIMARY} strokeWidth="1.5" />
      <circle cx="40" cy="110" r="3" fill={CYAN} />
      <text
        x="40"
        y="136"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="9"
        letterSpacing="0.14em"
        fill="#edf1f6"
      >
        STUDENT
      </text>

      {/* Waypoints */}
      {WAYPOINTS.map((wp, i) => (
        <g key={wp.label}>
          <circle cx={wp.x} cy="110" r="4" fill={PRIMARY} />
          <circle
            cx={wp.x}
            cy="110"
            r="9"
            fill="none"
            stroke={CYAN}
            strokeOpacity="0.28"
            className="animate-pulse-slow"
            style={{ animationDelay: `${i * 0.45}s` }}
          />
          <text
            x={wp.x}
            y="136"
            textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="8"
            letterSpacing="0.12em"
            fill="#93a0b4"
          >
            {wp.label}
          </text>
        </g>
      ))}

      {/* Destination — an abstract technology environment */}
      <g>
        <circle cx="620" cy="110" r="26" fill="none" stroke={BORDER} strokeDasharray="2 4" />
        <circle cx="620" cy="110" r="14" fill="#0d1119" stroke={PRIMARY} strokeOpacity="0.7" />
        <circle cx="620" cy="110" r="6" fill={CYAN} fillOpacity="0.5" className="animate-pulse-slow" />
        <text
          x="620"
          y="152"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="9"
          letterSpacing="0.14em"
          fill="#edf1f6"
        >
          TECHNOLOGY
        </text>
      </g>

      {/* Floating context labels — small, quiet, off the main line */}
      {FLOATING.map((f, i) => (
        <g key={f.label} className="animate-pulse-slow" style={{ animationDelay: `${0.3 + i * 0.6}s` }}>
          <circle cx={f.x} cy={f.y} r="2" fill={PRIMARY} />
          <text
            x={f.x + 8}
            y={f.y + 3}
            fontFamily="'JetBrains Mono', monospace"
            fontSize="7.5"
            letterSpacing="0.1em"
            fill="#576076"
          >
            {f.label}
          </text>
        </g>
      ))}

      {/* A few abstract "artifacts" along the way — panels, branches, nodes */}
      <g opacity="0.55">
        <rect x="96" y="62" width="22" height="15" rx="2" fill="#0d1119" stroke={BORDER} />
        <line x1="100" y1="68" x2="112" y2="68" stroke={PRIMARY} strokeOpacity="0.6" />
        <line x1="100" y1="72" x2="108" y2="72" stroke={BORDER} />

        <path d="M320 168v-10a6 6 0 016-6h10" stroke={BORDER} />
        <circle cx="320" cy="170" r="2.5" fill={PRIMARY} />
        <circle cx="338" cy="152" r="2.5" fill={CYAN} />

        <rect x="452" y="152" width="26" height="18" rx="2" fill="#0d1119" stroke={BORDER} />
        <line x1="457" y1="159" x2="473" y2="159" stroke={CYAN} strokeOpacity="0.5" />
        <line x1="457" y1="164" x2="467" y2="164" stroke={BORDER} />
      </g>
    </svg>
  );
}
