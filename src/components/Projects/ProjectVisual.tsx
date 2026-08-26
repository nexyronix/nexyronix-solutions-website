import type { ProjectVisual as VisualKind } from "@/data/projects";

interface ProjectVisualProps {
  kind: VisualKind;
  variant?: "card" | "featured";
}

const CYAN = "#45e0e8";
const PRIMARY = "#2e7cf6";
const VIOLET = "#7c6fe8";
const BORDER = "#242d3d";
const PANEL = "#0d1119";
const RAISED = "#121826";
const FAINT = "#576076";

/**
 * Abstract interface mockups built entirely from SVG primitives. All labels
 * are deliberately non-textual (bars and blocks) so nothing can read as real
 * product copy or client data.
 */
export function ProjectVisual({ kind, variant = "card" }: ProjectVisualProps) {
  const isFeatured = variant === "featured";
  const height = isFeatured ? 300 : 150;

  return (
    <svg
      viewBox="0 0 320 160"
      width="100%"
      height={height}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className="h-full w-full"
    >
      {render(kind)}
    </svg>
  );
}

function render(kind: VisualKind) {
  switch (kind) {
    case "dashboard":
      return <DashboardVisual />;
    case "assistant":
      return <AssistantVisual />;
    case "workspace":
      return <WorkspaceVisual />;
    case "mobile":
      return <MobileVisual />;
    case "storefront":
      return <StorefrontVisual />;
    case "workflow":
      return <WorkflowVisual />;
    default:
      return null;
  }
}

/** Browser chrome shared by several of the visuals. */
function BrowserFrame({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="5" fill={PANEL} stroke={BORDER} />
      <rect x={x} y={y} width={w} height="12" rx="5" fill={RAISED} />
      <rect x={x} y={y + 7} width={w} height="5" fill={RAISED} />
      <circle cx={x + 8} cy={y + 6} r="1.6" fill={FAINT} />
      <circle cx={x + 14} cy={y + 6} r="1.6" fill={FAINT} />
      <circle cx={x + 20} cy={y + 6} r="1.6" fill={CYAN} className="animate-pulse-slow" />
      <line x1={x} y1={y + 12} x2={x + w} y2={y + 12} stroke={BORDER} />
    </>
  );
}

function DashboardVisual() {
  return (
    <g>
      <BrowserFrame x={30} y={18} w={260} h={124} />
      {/* Sidebar */}
      <line x1={78} y1={30} x2={78} y2={142} stroke={BORDER} />
      {[38, 50, 62, 74, 86].map((y, i) => (
        <rect key={y} x={38} y={y} width={i === 0 ? 30 : 26} height="4" rx="2" fill={i === 0 ? PRIMARY : BORDER} />
      ))}
      {/* Stat tiles — deliberately wordless */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={90 + i * 64} y={24} width={56} height={26} rx="3" fill={RAISED} stroke={BORDER} />
      ))}
      <rect x={96} y={32} width={22} height="4" rx="2" fill={CYAN} opacity="0.8" />
      <rect x={160} y={32} width={30} height="4" rx="2" fill={BORDER} />
      <rect x={224} y={32} width={18} height="4" rx="2" fill={BORDER} />
      {/* Chart */}
      <rect x={90} y={58} width={120} height={78} rx="3" fill={RAISED} stroke={BORDER} />
      <polyline
        points="98,120 118,104 138,112 158,86 178,96 198,72"
        stroke={CYAN}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={198} cy={72} r="2.5" fill={CYAN} className="animate-pulse-slow" />
      {/* Side list */}
      <rect x={218} y={58} width={64} height={78} rx="3" fill={RAISED} stroke={BORDER} />
      {[68, 82, 96, 110, 124].map((y) => (
        <rect key={y} x={226} y={y} width={40} height="4" rx="2" fill={BORDER} />
      ))}
    </g>
  );
}

function AssistantVisual() {
  return (
    <g>
      <BrowserFrame x={44} y={20} w={232} h={120} />
      {/* Conversation blocks */}
      <rect x={56} y={40} width={90} height={18} rx="6" fill={RAISED} stroke={BORDER} />
      <rect x={64} y={47} width={60} height="4" rx="2" fill={FAINT} />
      <rect x={158} y={66} width={106} height={22} rx="6" fill={PANEL} stroke={PRIMARY} strokeOpacity="0.5" />
      <rect x={166} y={73} width={70} height="4" rx="2" fill={PRIMARY} opacity="0.7" />
      <rect x={166} y={80} width={44} height="4" rx="2" fill={BORDER} />
      <rect x={56} y={96} width={72} height={18} rx="6" fill={RAISED} stroke={BORDER} />
      <rect x={64} y={103} width={48} height="4" rx="2" fill={FAINT} />
      {/* Thinking indicator */}
      <circle cx={166} cy={104} r="2" fill={CYAN} className="animate-pulse-slow" />
      <circle cx={174} cy={104} r="2" fill={CYAN} opacity="0.6" className="animate-pulse-slow" />
      <circle cx={182} cy={104} r="2" fill={CYAN} opacity="0.3" className="animate-pulse-slow" />
      {/* Small neural mark */}
      <g opacity="0.6">
        <circle cx={248} cy={104} r="1.8" fill={VIOLET} />
        <circle cx={258} cy={112} r="1.8" fill={VIOLET} />
        <circle cx={258} cy={96} r="1.8" fill={CYAN} />
        <line x1={248} y1={104} x2={258} y2={112} stroke={BORDER} />
        <line x1={248} y1={104} x2={258} y2={96} stroke={BORDER} />
      </g>
    </g>
  );
}

function WorkspaceVisual() {
  return (
    <g>
      <BrowserFrame x={30} y={18} w={260} h={124} />
      {/* Kanban columns */}
      {[0, 1, 2].map((col) => (
        <g key={col}>
          <rect x={42 + col * 82} y={28} width={70} height={104} rx="4" fill={RAISED} stroke={BORDER} />
          <rect x={50 + col * 82} y={36} width={30} height="4" rx="2" fill={col === 1 ? CYAN : BORDER} opacity={col === 1 ? 0.8 : 1} />
        </g>
      ))}
      {/* Cards inside columns */}
      {[
        [0, 48], [0, 70], [0, 92],
        [1, 48], [1, 76],
        [2, 48], [2, 70], [2, 92],
      ].map(([col, y], i) => (
        <g key={i}>
          <rect x={50 + col * 82} y={y} width={54} height={16} rx="3" fill={PANEL} stroke={BORDER} />
          <rect x={56 + col * 82} y={y + 6} width={30} height="3" rx="1.5" fill={FAINT} />
        </g>
      ))}
      <circle cx={104} cy={56} r="2" fill={CYAN} className="animate-pulse-slow" />
    </g>
  );
}

function MobileVisual() {
  return (
    <g>
      {/* Two phones, offset for depth */}
      <g opacity="0.5">
        <rect x={108} y={22} width={54} height={116} rx="8" fill={PANEL} stroke={BORDER} />
        <rect x={116} y={38} width={38} height="4" rx="2" fill={BORDER} />
        <rect x={116} y={50} width={38} height={28} rx="3" fill={RAISED} />
        <rect x={116} y={84} width={26} height="4" rx="2" fill={BORDER} />
      </g>
      <rect x={158} y={14} width={58} height={132} rx="9" fill={PANEL} stroke={PRIMARY} strokeOpacity="0.5" />
      <rect x={178} y={20} width={18} height="3" rx="1.5" fill={BORDER} />
      <rect x={166} y={34} width={42} height="4" rx="2" fill={CYAN} opacity="0.8" />
      <rect x={166} y={46} width={42} height={32} rx="3" fill={RAISED} stroke={BORDER} />
      <circle cx={187} cy={62} r="7" fill="none" stroke={CYAN} strokeOpacity="0.6" />
      {[86, 98, 110].map((y) => (
        <rect key={y} x={166} y={y} width={y === 86 ? 42 : 30} height="4" rx="2" fill={BORDER} />
      ))}
      {/* Tab bar */}
      <line x1={158} y1={126} x2={216} y2={126} stroke={BORDER} />
      {[168, 187, 206].map((cx, i) => (
        <circle key={cx} cx={cx} cy={136} r="2.5" fill={i === 1 ? CYAN : FAINT} />
      ))}
    </g>
  );
}

function StorefrontVisual() {
  return (
    <g>
      <BrowserFrame x={30} y={18} w={260} h={124} />
      {/* Product grid */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={42 + i * 62} y={28} width={54} height={48} rx="4" fill={RAISED} stroke={i === 1 ? CYAN : BORDER} strokeOpacity={i === 1 ? 0.6 : 1} />
          <rect x={50 + i * 62} y={62} width={30} height="4" rx="2" fill={BORDER} />
          <rect x={50 + i * 62} y={69} width={18} height="3" rx="1.5" fill={i === 1 ? CYAN : FAINT} opacity="0.8" />
        </g>
      ))}
      {/* Cart panel */}
      <rect x={230} y={28} width={52} height={104} rx="4" fill={RAISED} stroke={BORDER} />
      <rect x={238} y={36} width={26} height="4" rx="2" fill={PRIMARY} opacity="0.8" />
      {[48, 62, 76].map((y) => (
        <g key={y}>
          <rect x={238} y={y} width={14} height={10} rx="2" fill={PANEL} stroke={BORDER} />
          <rect x={256} y={y + 3} width={18} height="3" rx="1.5" fill={FAINT} />
        </g>
      ))}
      <rect x={238} y={110} width={36} height={12} rx="6" fill={PRIMARY} opacity="0.85" />
      {/* Lower product row */}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={42 + i * 62} y={84} width={54} height={40} rx="4" fill={RAISED} stroke={BORDER} opacity="0.7" />
      ))}
    </g>
  );
}

function WorkflowVisual() {
  const nodes: [number, number][] = [
    [56, 80],
    [116, 46],
    [116, 114],
    [186, 80],
    [252, 52],
    [252, 108],
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [3, 4],
    [3, 5],
  ];
  return (
    <g>
      <rect x={24} y={18} width={272} height={124} rx="6" fill={PANEL} stroke={BORDER} />
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke={i % 2 === 0 ? CYAN : BORDER}
          strokeOpacity={i % 2 === 0 ? 0.5 : 1}
          strokeWidth="1.2"
          strokeDasharray={i % 2 === 0 ? "3 5" : undefined}
          className={i % 2 === 0 ? "animate-dash-flow" : undefined}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 14} y={y - 10} width={28} height={20} rx="4" fill={RAISED} stroke={i === 3 ? CYAN : BORDER} strokeOpacity={i === 3 ? 0.7 : 1} />
          <rect x={x - 8} y={y - 2} width={16} height="3" rx="1.5" fill={i === 3 ? CYAN : FAINT} opacity="0.8" />
        </g>
      ))}
      <circle cx={186} cy={80} r="17" fill="none" stroke={CYAN} strokeOpacity="0.3" className="animate-pulse-slow" />
    </g>
  );
}
