import type { SolutionVisualKind } from "./solutionsData";

interface SolutionVisualProps {
  kind: SolutionVisualKind;
}

// Mirror of the design tokens in src/index.css — kept as local consts since
// SVG attributes can't read CSS custom properties directly in every browser.
const PRIMARY = "#2e7cf6";
const CYAN = "#45e0e8";
const BORDER = "#242d3d";
const FAINT = "#576076";
const PANEL = "#0d1119";
const PANEL_RAISED = "#121826";

export function SolutionVisual({ kind }: SolutionVisualProps) {
  switch (kind) {
    case "websites":
      return <WebsitesVisual />;
    case "applications":
      return <ApplicationsVisual />;
    case "custom-software":
      return <CustomSoftwareVisual />;
    case "ai":
      return <AiVisual />;
    case "saas":
      return <SaasVisual />;
    case "automation":
      return <AutomationVisual />;
    case "data-apis":
      return <DataApisVisual />;
    case "ecommerce":
      return <EcommerceVisual />;
    default:
      return null;
  }
}

function WebsitesVisual() {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" fill="none" aria-hidden="true">
      <rect x="6" y="20" width="56" height="36" rx="4" fill={PANEL} stroke={BORDER} />
      <rect x="6" y="20" width="56" height="9" rx="4" fill={PANEL_RAISED} />
      <circle cx="12" cy="24.5" r="1.2" fill={FAINT} />
      <circle cx="16.5" cy="24.5" r="1.2" fill={FAINT} />
      <line x1="14" y1="38" x2="48" y2="38" stroke={BORDER} strokeWidth="1.5" />
      <line x1="14" y1="45" x2="38" y2="45" stroke={BORDER} strokeWidth="1.5" />

      <rect x="32" y="10" width="56" height="36" rx="4" fill={PANEL} stroke={PRIMARY} strokeOpacity="0.55" />
      <rect x="32" y="10" width="56" height="9" rx="4" fill={PANEL_RAISED} />
      <circle cx="38" cy="14.5" r="1.2" fill={CYAN} className="animate-pulse-slow" />
      <line x1="40" y1="28" x2="74" y2="28" stroke={PRIMARY} strokeOpacity="0.5" strokeWidth="1.5" />
      <line x1="40" y1="35" x2="60" y2="35" stroke={PRIMARY} strokeOpacity="0.3" strokeWidth="1.5" />
    </svg>
  );
}

function ApplicationsVisual() {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" fill="none" aria-hidden="true">
      <line x1="48" y1="32" x2="20" y2="14" stroke={BORDER} strokeWidth="1.2" />
      <line x1="48" y1="32" x2="76" y2="14" stroke={BORDER} strokeWidth="1.2" />
      <line x1="48" y1="32" x2="20" y2="50" stroke={BORDER} strokeWidth="1.2" />
      <line x1="48" y1="32" x2="76" y2="50" stroke={BORDER} strokeWidth="1.2" />
      <rect x="12" y="8" width="16" height="14" rx="3" fill={PANEL} stroke={BORDER} />
      <rect x="68" y="8" width="16" height="14" rx="3" fill={PANEL} stroke={BORDER} />
      <rect x="12" y="44" width="16" height="14" rx="3" fill={PANEL} stroke={BORDER} />
      <rect x="68" y="44" width="16" height="14" rx="3" fill={PANEL} stroke={CYAN} className="animate-pulse-slow" />
      <rect x="42" y="26" width="12" height="12" rx="3" fill={PANEL_RAISED} stroke={PRIMARY} />
    </svg>
  );
}

function CustomSoftwareVisual() {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" fill="none" aria-hidden="true">
      <rect x="16" y="14" width="64" height="10" rx="2.5" fill={PANEL} stroke={BORDER} />
      <rect x="22" y="27" width="52" height="10" rx="2.5" fill={PANEL_RAISED} stroke={PRIMARY} strokeOpacity="0.5" />
      <rect x="16" y="40" width="64" height="10" rx="2.5" fill={PANEL} stroke={BORDER} />
      <circle cx="74" cy="32" r="2" fill={CYAN} className="animate-pulse-slow" />
    </svg>
  );
}

function AiVisual() {
  const nodes: [number, number][] = [
    [16, 32],
    [38, 14],
    [38, 50],
    [62, 10],
    [62, 32],
    [62, 54],
    [84, 32],
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 4],
    [2, 5],
    [4, 6],
    [3, 6],
    [5, 6],
  ];
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" fill="none" aria-hidden="true">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke={BORDER}
          strokeWidth="1"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === 4 ? 2.6 : 1.8}
          fill={i === 4 ? CYAN : PRIMARY}
          className={i === 4 ? "animate-pulse-slow" : undefined}
        />
      ))}
    </svg>
  );
}

function SaasVisual() {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" fill="none" aria-hidden="true">
      <path
        d="M30 40a12 12 0 0 1-2-23.8A16 16 0 0 1 58 14a11 11 0 0 1 10 26H30z"
        fill={PANEL}
        stroke={PRIMARY}
        strokeOpacity="0.6"
      />
      <line x1="24" y1="46" x2="24" y2="54" stroke={BORDER} />
      <line x1="48" y1="46" x2="48" y2="56" stroke={BORDER} />
      <line x1="66" y1="46" x2="66" y2="54" stroke={BORDER} />
      <circle cx="24" cy="56" r="2" fill={BORDER} />
      <circle cx="48" cy="58" r="2.2" fill={CYAN} className="animate-pulse-slow" />
      <circle cx="66" cy="56" r="2" fill={BORDER} />
    </svg>
  );
}

function AutomationVisual() {
  const path = "M14 44C30 44 30 20 48 20C66 20 66 44 82 44";
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" fill="none" aria-hidden="true">
      <path d={path} stroke={BORDER} strokeWidth="1.4" />
      <path
        d={path}
        stroke={CYAN}
        strokeWidth="1.4"
        strokeOpacity="0.75"
        strokeDasharray="4 7"
        className="animate-dash-flow"
      />
      <circle cx="14" cy="44" r="3" fill={PRIMARY} />
      <circle cx="48" cy="20" r="3" fill={PANEL_RAISED} stroke={PRIMARY} />
      <circle cx="82" cy="44" r="3" fill={PRIMARY} />
    </svg>
  );
}

function DataApisVisual() {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" fill="none" aria-hidden="true">
      <line x1="14" y1="18" x2="82" y2="18" stroke={BORDER} strokeWidth="1.2" />
      <line
        x1="14"
        y1="32"
        x2="82"
        y2="32"
        stroke={CYAN}
        strokeOpacity="0.6"
        strokeWidth="1.2"
        strokeDasharray="3 6"
        className="animate-dash-flow"
      />
      <line x1="14" y1="46" x2="82" y2="46" stroke={BORDER} strokeWidth="1.2" />
      <circle cx="14" cy="18" r="2" fill={PRIMARY} />
      <circle cx="82" cy="18" r="2" fill={BORDER} />
      <circle cx="14" cy="32" r="2.2" fill={CYAN} className="animate-pulse-slow" />
      <circle cx="82" cy="32" r="2" fill={CYAN} />
      <circle cx="14" cy="46" r="2" fill={PRIMARY} />
      <circle cx="82" cy="46" r="2" fill={BORDER} />
    </svg>
  );
}

function EcommerceVisual() {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" fill="none" aria-hidden="true">
      <rect x="18" y="16" width="14" height="14" rx="2.5" fill={PANEL} stroke={BORDER} />
      <rect x="36" y="16" width="14" height="14" rx="2.5" fill={PANEL} stroke={BORDER} />
      <rect x="54" y="16" width="14" height="14" rx="2.5" fill={PANEL} stroke={CYAN} className="animate-pulse-slow" />
      <path d="M20 38h48l-5 16H27L20 38z" fill={PANEL} stroke={PRIMARY} strokeOpacity="0.55" />
      <circle cx="32" cy="58" r="2.4" fill={BORDER} />
      <circle cx="56" cy="58" r="2.4" fill={BORDER} />
    </svg>
  );
}
