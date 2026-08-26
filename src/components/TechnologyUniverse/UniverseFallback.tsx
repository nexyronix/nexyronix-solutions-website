import { getTechNodes } from "./technologyNodesData";

/**
 * Rendered instead of the Canvas when the user prefers reduced motion or
 * their browser can't do WebGL. Same information (core + all ten nodes),
 * laid out as a static circle — no animation, no WebGL cost.
 */
export function UniverseFallback() {
  const nodes = getTechNodes(10);
  const cx = 200;
  const cy = 200;
  const r = 150;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 400 400" width="100%" height="100%" className="max-h-full max-w-full" aria-hidden="true">
        {nodes.map((node, i) => {
          const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          return <line key={`l-${node.id}`} x1={cx} y1={cy} x2={x} y2={y} stroke="#232c3b" strokeWidth="1" />;
        })}

        <circle cx={cx} cy={cy} r="34" fill="#0d1119" stroke="#2e7cf6" strokeOpacity="0.5" />
        <circle cx={cx} cy={cy} r="20" fill="#45e0e8" fillOpacity="0.08" />

        {nodes.map((node, i) => {
          const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          return <circle key={`d-${node.id}`} cx={x} cy={y} r="4.5" fill="#45e0e8" fillOpacity="0.85" />;
        })}

        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontFamily="'Space Grotesk', sans-serif"
          fontSize="11"
          fontWeight="600"
          fill="#edf1f6"
        >
          NEXYRONIX
        </text>
      </svg>
    </div>
  );
}
