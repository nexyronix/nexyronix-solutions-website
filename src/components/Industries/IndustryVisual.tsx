import type { Industry } from "./industriesData";

interface IndustryVisualProps {
  industries: Industry[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const CYAN = "#45e0e8";
const PRIMARY = "#2e7cf6";
const BORDER = "#232c3b";

const CENTER = 200;
const RING_RADIUS = 150;
const TECH_RADIUS = 194;

function pointOnCircle(angle: number, radius: number): [number, number] {
  return [CENTER + Math.cos(angle) * radius, CENTER + Math.sin(angle) * radius];
}

/**
 * A single reusable 2D scene — selecting an industry never mounts a new
 * scene, it just changes which node is emphasized and which technology
 * satellites are shown. Echoes the Phase 4 core/ring/pulse language in a
 * lightweight, non-3D form, as the brief asks.
 */
export function IndustryVisual({ industries, selectedId, onSelect }: IndustryVisualProps) {
  const total = industries.length;
  const selectedIndex = industries.findIndex((ind) => ind.id === selectedId);
  const selected = industries[selectedIndex];
  const selectedAngle = (selectedIndex / total) * Math.PI * 2 - Math.PI / 2;

  const techCount = selected?.technologies.length ?? 0;
  const spread = Math.min(0.9, techCount * 0.16);

  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" className="max-h-full max-w-full" role="presentation">
      {/* Primary spokes — core to every industry node */}
      {industries.map((ind, i) => {
        const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
        const [x, y] = pointOnCircle(angle, RING_RADIUS);
        const isActive = ind.id === selectedId;
        return (
          <line
            key={`spoke-${ind.id}`}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke={isActive ? CYAN : BORDER}
            strokeWidth="1"
            strokeOpacity={isActive ? 0.7 : 0.5}
            className="transition-all duration-500 ease-signature"
          />
        );
      })}

      {/* Technology satellites — branch outward from the selected node only */}
      {selected &&
        selected.technologies.map((tech, i) => {
          const offset = techCount > 1 ? (i / (techCount - 1) - 0.5) * spread : 0;
          const angle = selectedAngle + offset;
          const [x, y] = pointOnCircle(angle, TECH_RADIUS);
          const [nx, ny] = pointOnCircle(selectedAngle, RING_RADIUS);
          return (
            <g key={`tech-${tech}`} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <line x1={nx} y1={ny} x2={x} y2={y} stroke={PRIMARY} strokeOpacity="0.45" strokeWidth="1" />
              <circle cx={x} cy={y} r="3" fill={PRIMARY} />
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="7"
                letterSpacing="0.05em"
                fill="#93a0b4"
              >
                {tech}
              </text>
            </g>
          );
        })}

      {/* Industry nodes */}
      {industries.map((ind, i) => {
        const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
        const [x, y] = pointOnCircle(angle, RING_RADIUS);
        const isActive = ind.id === selectedId;
        return (
          <g
            key={ind.id}
            onClick={() => onSelect(ind.id)}
            className="cursor-pointer"
            role="button"
            aria-label={ind.name}
          >
            <circle cx={x} cy={y} r="22" fill="transparent" />
            {isActive && (
              <circle cx={x} cy={y} r="9" fill="none" stroke={CYAN} strokeOpacity="0.5" className="animate-pulse-slow" />
            )}
            <circle
              cx={x}
              cy={y}
              r={isActive ? 5 : 3.2}
              fill={isActive ? CYAN : "#576076"}
              className="transition-all duration-300"
            />
          </g>
        );
      })}

      {/* Core */}
      <circle cx={CENTER} cy={CENTER} r="30" fill="#0d1119" stroke={PRIMARY} strokeOpacity="0.5" />
      <circle cx={CENTER} cy={CENTER} r="18" fill={CYAN} fillOpacity="0.08" />
      <text
        x={CENTER}
        y={CENTER + 4}
        textAnchor="middle"
        fontFamily="'Space Grotesk', sans-serif"
        fontSize="10"
        fontWeight="600"
        fill="#edf1f6"
      >
        NEXYRONIX
      </text>
    </svg>
  );
}
