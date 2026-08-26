import { Html } from "@react-three/drei";
import type { TechNode } from "./technologyNodesData";

interface NodeInfoPanelProps {
  node: TechNode;
}

/** Anchored at the node's position with a CSS offset so it sits beside the node, not on top of it. */
export function NodeInfoPanel({ node }: NodeInfoPanelProps) {
  return (
    <Html position={node.position} center={false} distanceFactor={8} occlude={false} zIndexRange={[50, 0]}>
      <div
        className="pointer-events-none w-44 -translate-y-1/2 translate-x-4 rounded-lg border border-border-strong bg-bg-elevated/90 p-3 shadow-raised backdrop-blur-md"
        role="status"
      >
        <p className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-text">{node.label}</p>
        <p className="mt-1.5 text-[11px] leading-snug text-text-muted">{node.description}</p>
      </div>
    </Html>
  );
}
