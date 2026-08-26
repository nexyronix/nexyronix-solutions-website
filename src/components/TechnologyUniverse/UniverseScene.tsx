import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { NexyronixCore } from "./NexyronixCore";
import { TechnologyNode } from "./TechnologyNode";
import { TechnologyConnections } from "./TechnologyConnections";
import { NodeInfoPanel } from "./NodeInfoPanel";
import { UniverseParticles } from "./UniverseParticles";
import { getTechNodes, connectedIdsOf } from "./technologyNodesData";
import type { DeviceTier } from "@/hooks/useDeviceTier";

interface UniverseSceneProps {
  tier: DeviceTier;
  activeId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onReady?: () => void;
}

const TIER_CONFIG: Record<
  DeviceTier,
  { particles: number; nodeCount: number; secondary: boolean; coreDetail: number }
> = {
  high: { particles: 900, nodeCount: 10, secondary: true, coreDetail: 2 },
  medium: { particles: 450, nodeCount: 10, secondary: true, coreDetail: 1 },
  low: { particles: 180, nodeCount: 6, secondary: false, coreDetail: 0 },
};

export function UniverseScene({ tier, activeId, onHover, onSelect, onReady }: UniverseSceneProps) {
  const config = TIER_CONFIG[tier];
  const nodes = getTechNodes(config.nodeCount);
  const activeNode = nodes.find((n) => n.id === activeId) ?? null;
  const connected = useMemo(() => connectedIdsOf(activeId), [activeId]);

  return (
    <Canvas
      dpr={[1, tier === "high" ? 2 : 1.5]}
      camera={{ position: [0, 0.6, 7.5], fov: 44 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={() => onReady?.()}
    >
      <color attach="background" args={["#05070a"]} />
      <fogExp2 attach="fog" args={["#05070a", 0.045]} />

      <ambientLight intensity={0.3} />
      <pointLight position={[5, 3, 5]} intensity={1} color="#45e0e8" />
      <pointLight position={[-5, -3, -4]} intensity={0.55} color="#2e7cf6" />
      <directionalLight position={[0, 5, 6]} intensity={0.2} color="#edf1f6" />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 1.7}
        autoRotate
        autoRotateSpeed={0.35}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.4}
      />

      <Suspense fallback={null}>
        <NexyronixCore detail={config.coreDetail} dimmed={activeId !== null} />

        <TechnologyConnections nodes={nodes} activeId={activeId} showSecondary={config.secondary} />

        {nodes.map((node) => (
          <TechnologyNode
            key={node.id}
            node={node}
            isActive={node.id === activeId}
            isConnected={connected.has(node.id)}
            showLabel
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}

        {activeNode && <NodeInfoPanel node={activeNode} />}

        <UniverseParticles count={config.particles} />
      </Suspense>
    </Canvas>
  );
}
