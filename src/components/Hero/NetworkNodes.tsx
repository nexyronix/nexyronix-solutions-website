import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { getNetworkNodes, type NodeConfig } from "./nodeData";

interface NetworkNodesProps {
  count: number;
  showLabels: boolean;
}

const ACCENT_CYAN = "#45e0e8";
const LINE_COLOR = "#1b2230"; // matches --color-border-strong-ish, kept subtle

export function NetworkNodes({ count, showLabels }: NetworkNodesProps) {
  const nodes = useMemo(() => getNetworkNodes(count), [count]);

  return (
    <group>
      {nodes.map((node, i) => (
        <NetworkNode key={node.label} node={node} index={i} showLabel={showLabels} />
      ))}
    </group>
  );
}

function NetworkNode({ node, index, showLabel }: { node: NodeConfig; index: number; showLabel: boolean }) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const target = useMemo(() => new THREE.Vector3(...node.position), [node.position]);
  const speed = 0.16 + (index % 3) * 0.04;
  const phase = index * 0.37;

  useFrame(({ clock }) => {
    if (!pulseRef.current) return;
    const t = (clock.getElapsedTime() * speed + phase) % 1;
    pulseRef.current.position.lerpVectors(origin, target, t);
    const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
    // Fade the pulse in/out at the ends of its travel so it doesn't "pop"
    mat.opacity = t < 0.12 ? t / 0.12 : t > 0.85 ? (1 - t) / 0.15 : 1;
  });

  return (
    <group>
      <Line points={[origin, target]} color={LINE_COLOR} lineWidth={1} transparent opacity={0.6} />

      <mesh position={node.position}>
        <sphereGeometry args={[0.032, 12, 12]} />
        <meshBasicMaterial color={ACCENT_CYAN} transparent opacity={0.9} />
      </mesh>

      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color={ACCENT_CYAN} transparent opacity={0} />
      </mesh>

      {showLabel && (
        <Html position={node.position} center distanceFactor={8} occlude={false}>
          <div className="pointer-events-none select-none whitespace-nowrap rounded-pill border border-border bg-bg-elevated/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted backdrop-blur-sm">
            {node.label}
          </div>
        </Html>
      )}
    </group>
  );
}
