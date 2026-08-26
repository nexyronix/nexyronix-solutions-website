import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh } from "three";
import { SECONDARY_CONNECTIONS, connectedIdsOf, type TechNode } from "./technologyNodesData";

interface TechnologyConnectionsProps {
  nodes: TechNode[];
  activeId: string | null;
  showSecondary: boolean;
}

const CYAN = "#45e0e8";
const BORDER = "#232c3b";

export function TechnologyConnections({ nodes, activeId, showSecondary }: TechnologyConnectionsProps) {
  const connected = useMemo(() => connectedIdsOf(activeId), [activeId]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const secondaryPairs = useMemo(() => {
    if (!showSecondary) return [];
    return SECONDARY_CONNECTIONS.filter(([a, b]) => byId.has(a) && byId.has(b));
  }, [byId, showSecondary]);

  return (
    <group>
      {nodes.map((node, i) => {
        const isActive = node.id === activeId;
        const isConnected = connected.has(node.id);
        return (
          <ConnectionLine
            key={`primary-${node.id}`}
            from={origin}
            to={new THREE.Vector3(...node.position)}
            emphasis={isActive ? "active" : isConnected ? "connected" : "idle"}
            speed={0.14 + (i % 3) * 0.03}
            phase={i * 0.31}
          />
        );
      })}

      {secondaryPairs.map(([aId, bId], i) => {
        const a = byId.get(aId)!;
        const b = byId.get(bId)!;
        const isActive = aId === activeId || bId === activeId;
        return (
          <ConnectionLine
            key={`secondary-${aId}-${bId}`}
            from={new THREE.Vector3(...a.position)}
            to={new THREE.Vector3(...b.position)}
            emphasis={isActive ? "active" : "idle"}
            speed={0.1 + (i % 2) * 0.03}
            phase={i * 0.5 + 0.2}
            dim
          />
        );
      })}
    </group>
  );
}

interface ConnectionLineProps {
  from: THREE.Vector3;
  to: THREE.Vector3;
  emphasis: "active" | "connected" | "idle";
  speed: number;
  phase: number;
  /** Secondary (node-to-node) links render a touch dimmer than primary spokes. */
  dim?: boolean;
}

function ConnectionLine({ from, to, emphasis, speed, phase, dim = false }: ConnectionLineProps) {
  const pulseRef = useRef<Mesh>(null);

  const baseOpacity = emphasis === "active" ? 0.85 : emphasis === "connected" ? 0.55 : dim ? 0.16 : 0.28;
  const lineColor = emphasis === "active" ? CYAN : BORDER;

  useFrame(({ clock }) => {
    if (!pulseRef.current) return;
    const t = (clock.getElapsedTime() * speed + phase) % 1;
    pulseRef.current.position.lerpVectors(from, to, t);
    const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
    const edgeFade = t < 0.1 ? t / 0.1 : t > 0.85 ? (1 - t) / 0.15 : 1;
    mat.opacity = emphasis === "idle" && !dim ? edgeFade * 0.4 : edgeFade;
  });

  return (
    <group>
      <Line points={[from, to]} color={lineColor} lineWidth={1} transparent opacity={baseOpacity} />
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0} />
      </mesh>
    </group>
  );
}
