import { TECH_CATEGORIES, TECHNOLOGIES, type TechCategoryId, type Technology } from "@/data/technologies";

interface TechnologyConstellationProps {
  activeCategory: TechCategoryId | "all";
  selected: Technology | null;
  onSelectCategory: (category: TechCategoryId | "all") => void;
}

const CYAN = "#45e0e8";
const PRIMARY = "#2e7cf6";
const BORDER = "#232c3b";
const FAINT = "#576076";

const CENTER = 200;
const CLUSTER_RADIUS = 128;
const LEAF_RADIUS = 40;

function pointOn(angle: number, radius: number, cx = CENTER, cy = CENTER): [number, number] {
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
}

/**
 * Six category clusters arranged around the Nexyronix core, each with its
 * member technologies as small leaf nodes. Unlike the Phase 4 universe this
 * is grouped rather than uniform — the structure itself carries the
 * "technologies belong to layers" idea.
 */
export function TechnologyConstellation({
  activeCategory,
  selected,
  onSelectCategory,
}: TechnologyConstellationProps) {
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" className="max-h-full max-w-full">
      {TECH_CATEGORIES.map((category, i) => {
        const angle = (i / TECH_CATEGORIES.length) * Math.PI * 2 - Math.PI / 2;
        const [cx, cy] = pointOn(angle, CLUSTER_RADIUS);

        const isDimmed = activeCategory !== "all" && activeCategory !== category.id;
        const isSelectedCat = selected?.category === category.id;
        const emphasis = isSelectedCat || activeCategory === category.id;

        const members = TECHNOLOGIES.filter((t) => t.category === category.id);

        return (
          <g
            key={category.id}
            className="cursor-pointer transition-opacity duration-500 ease-signature"
            opacity={isDimmed ? 0.25 : 1}
            onClick={() => onSelectCategory(activeCategory === category.id ? "all" : category.id)}
            role="button"
            aria-label={`${category.label} technologies`}
          >
            {/* Spoke to the core */}
            <line
              x1={CENTER}
              y1={CENTER}
              x2={cx}
              y2={cy}
              stroke={emphasis ? CYAN : BORDER}
              strokeWidth="1"
              strokeOpacity={emphasis ? 0.7 : 0.55}
              className="transition-all duration-500"
            />

            {/* Member technologies as small leaves around the cluster hub */}
            {members.map((tech, j) => {
              const leafAngle = angle + ((j / Math.max(1, members.length)) * Math.PI * 1.4 - Math.PI * 0.7);
              const [lx, ly] = pointOn(leafAngle, LEAF_RADIUS, cx, cy);
              const isSelectedLeaf = selected?.id === tech.id;
              return (
                <g key={tech.id}>
                  <line x1={cx} y1={cy} x2={lx} y2={ly} stroke={BORDER} strokeWidth="0.7" strokeOpacity="0.6" />
                  <circle
                    cx={lx}
                    cy={ly}
                    r={isSelectedLeaf ? 3.6 : 2}
                    fill={isSelectedLeaf ? CYAN : FAINT}
                    className="transition-all duration-300"
                  />
                  {isSelectedLeaf && (
                    <circle
                      cx={lx}
                      cy={ly}
                      r="7"
                      fill="none"
                      stroke={CYAN}
                      strokeOpacity="0.5"
                      className="animate-pulse-slow"
                    />
                  )}
                </g>
              );
            })}

            {/* Cluster hub */}
            <circle
              cx={cx}
              cy={cy}
              r={emphasis ? 8 : 6}
              fill="#0d1119"
              stroke={emphasis ? CYAN : PRIMARY}
              strokeOpacity={emphasis ? 0.9 : 0.5}
              className="transition-all duration-300"
            />
            <text
              x={cx}
              y={cy - 15}
              textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace"
              fontSize="7.5"
              letterSpacing="0.1em"
              fill={emphasis ? "#edf1f6" : "#93a0b4"}
              className="pointer-events-none uppercase"
            >
              {category.label}
            </text>
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
        className="pointer-events-none"
      >
        NEXYRONIX
      </text>
    </svg>
  );
}
