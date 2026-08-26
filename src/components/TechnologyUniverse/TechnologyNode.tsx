import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh } from "three";
import type { TechNode } from "./technologyNodesData";

interface TechnologyNodeProps {
  node: TechNode;
  /** This node is the hovered/selected one. */
  isActive: boolean;
  /** A different node is active, and this one is linked to it via a secondary connection. */
  isConnected: boolean;
  showLabel: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

const CYAN = "#45e0e8";
const PRIMARY = "#2e7cf6";
const FAINT_DOT = "#6b7794";

export function TechnologyNode({ node, isActive, isConnected, showLabel, onHover, onSelect }: TechnologyNodeProps) {
  const haloRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!haloRef.current) return;
    const targetScale = isActive ? 1 + Math.sin(performance.now() * 0.004) * 0.15 : 0;
    const current = haloRef.current.scale.x;
    const next = THREE.MathUtils.lerp(current, targetScale, delta * 6);
    haloRef.current.scale.setScalar(next);
  });

  const dotColor = isActive ? CYAN : isConnected ? PRIMARY : FAINT_DOT;
  const dotScale = isActive ? 1.7 : isConnected ? 1.25 : 1;

  function handlePointerOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    onHover(node.id);
  }
  function handlePointerOut(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    document.body.style.cursor = "auto";
    onHover(null);
  }
  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    onSelect(node.id);
  }

  return (
    <group position={node.position}>
      {/* Larger invisible hit area — easier to hover/click a small point precisely */}
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick} visible={false}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <mesh scale={dotScale}>
        <sphereGeometry args={[0.045, 14, 14]} />
        <meshBasicMaterial color={dotColor} transparent opacity={isActive || isConnected ? 1 : 0.75} />
      </mesh>

      {/* Pulse halo — only visible (scale > 0) while active */}
      <mesh ref={haloRef}>
        <ringGeometry args={[0.08, 0.095, 32]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {showLabel && (
        <Html center distanceFactor={8} occlude={false}>
          <span
            className={
              "pointer-events-none select-none whitespace-nowrap rounded-pill border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] backdrop-blur-sm transition-colors duration-300 " +
              (isActive
                ? "border-accent-cyan/60 bg-bg-elevated/85 text-text"
                : isConnected
                  ? "border-accent-primary/40 bg-bg-elevated/70 text-text-muted"
                  : "border-border bg-bg-elevated/60 text-text-faint")
            }
          >
            {node.label}
          </span>
        </Html>
      )}
    </group>
  );
}
