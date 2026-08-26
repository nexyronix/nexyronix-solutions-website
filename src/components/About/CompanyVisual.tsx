import { EVOLUTION_STAGES } from "@/data/company";

const CYAN = "#45e0e8";
const PRIMARY = "#2e7cf6";
const VIOLET = "#7c6fe8";
const BORDER = "#242d3d";
const FAINT = "#576076";

const STAGE_X = [70, 190, 310, 440];
const CENTER_Y = 95;

/**
 * A single lightweight SVG: one core that grows from a point into a
 * connected network across four stages. Reuses the established node /
 * luminous-line language rather than mounting another 3D scene.
 */
export function CompanyVisual() {
  return (
    <svg viewBox="0 0 520 170" width="100%" height="100%" fill="none" aria-hidden="true">
      {/* Baseline connecting the stages */}
      <line x1="40" y1={CENTER_Y} x2="490" y2={CENTER_Y} stroke={BORDER} strokeWidth="1" />
      <line
        x1="40"
        y1={CENTER_Y}
        x2="490"
        y2={CENTER_Y}
        stroke={CYAN}
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeDasharray="5 9"
        className="animate-dash-flow"
      />

      {/* Stage 1 — Idea: a single point */}
      <g>
        <circle cx={STAGE_X[0]} cy={CENTER_Y} r="5" fill={CYAN} />
        <circle
          cx={STAGE_X[0]}
          cy={CENTER_Y}
          r="12"
          fill="none"
          stroke={CYAN}
          strokeOpacity="0.3"
          className="animate-pulse-slow"
        />
      </g>

      {/* Stage 2 — Build: the point gains structure */}
      <g>
        <circle cx={STAGE_X[1]} cy={CENTER_Y} r="5" fill={CYAN} />
        {[-1, 1].map((dir) => (
          <g key={dir}>
            <line
              x1={STAGE_X[1]}
              y1={CENTER_Y}
              x2={STAGE_X[1] + dir * 20}
              y2={CENTER_Y - 22}
              stroke={PRIMARY}
              strokeOpacity="0.5"
            />
            <circle cx={STAGE_X[1] + dir * 20} cy={CENTER_Y - 22} r="3" fill={PRIMARY} />
          </g>
        ))}
        <line x1={STAGE_X[1] - 20} y1={CENTER_Y - 22} x2={STAGE_X[1] + 20} y2={CENTER_Y - 22} stroke={BORDER} />
      </g>

      {/* Stage 3 — Connect: a small cluster */}
      <g>
        <circle cx={STAGE_X[2]} cy={CENTER_Y} r="5" fill={CYAN} />
        {[
          [-28, -26],
          [28, -26],
          [-30, 24],
          [30, 24],
        ].map(([dx, dy], i) => (
          <g key={i}>
            <line
              x1={STAGE_X[2]}
              y1={CENTER_Y}
              x2={STAGE_X[2] + dx}
              y2={CENTER_Y + dy}
              stroke={PRIMARY}
              strokeOpacity="0.45"
            />
            <circle cx={STAGE_X[2] + dx} cy={CENTER_Y + dy} r="3" fill={i % 2 === 0 ? PRIMARY : CYAN} />
          </g>
        ))}
        {/* Cross-links between satellites — the "connect" idea */}
        <line
          x1={STAGE_X[2] - 28}
          y1={CENTER_Y - 26}
          x2={STAGE_X[2] + 28}
          y2={CENTER_Y - 26}
          stroke={BORDER}
          strokeOpacity="0.7"
        />
        <line
          x1={STAGE_X[2] - 30}
          y1={CENTER_Y + 24}
          x2={STAGE_X[2] + 30}
          y2={CENTER_Y + 24}
          stroke={BORDER}
          strokeOpacity="0.7"
        />
      </g>

      {/* Stage 4 — Grow: a fuller network */}
      <g>
        <circle cx={STAGE_X[3]} cy={CENTER_Y} r="6" fill={CYAN} />
        <circle
          cx={STAGE_X[3]}
          cy={CENTER_Y}
          r="42"
          fill="none"
          stroke={BORDER}
          strokeDasharray="2 4"
        />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = STAGE_X[3] + Math.cos(angle) * 34;
          const y = CENTER_Y + Math.sin(angle) * 34;
          return (
            <g key={i}>
              <line
                x1={STAGE_X[3]}
                y1={CENTER_Y}
                x2={x}
                y2={y}
                stroke={i % 3 === 0 ? CYAN : BORDER}
                strokeOpacity={i % 3 === 0 ? 0.5 : 0.8}
              />
              <circle cx={x} cy={y} r="2.6" fill={i % 3 === 0 ? CYAN : i % 3 === 1 ? PRIMARY : VIOLET} />
            </g>
          );
        })}
      </g>

      {/* Stage labels */}
      {EVOLUTION_STAGES.map((stage, i) => (
        <text
          key={stage}
          x={STAGE_X[i]}
          y={158}
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="9"
          letterSpacing="0.16em"
          fill={i === EVOLUTION_STAGES.length - 1 ? "#edf1f6" : FAINT}
          className="uppercase"
        >
          {stage}
        </text>
      ))}
    </svg>
  );
}
