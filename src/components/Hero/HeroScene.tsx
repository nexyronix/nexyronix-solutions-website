import { Suspense, useEffect, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DigitalCore } from "./DigitalCore";
import { NetworkNodes } from "./NetworkNodes";
import { Particles } from "./Particles";
import type { DeviceTier } from "@/hooks/useDeviceTier";

interface HeroSceneProps {
  tier: DeviceTier;
  onReady?: () => void;
}

const TIER_CONFIG: Record<
  DeviceTier,
  { particles: number; nodes: number; coreDetail: number; labels: boolean }
> = {
  high: { particles: 1100, nodes: 7, coreDetail: 2, labels: true },
  medium: { particles: 550, nodes: 7, coreDetail: 1, labels: true },
  low: { particles: 220, nodes: 4, coreDetail: 0, labels: false },
};

/** Moves the camera a little toward the pointer each frame — the "alive" feeling, kept subtle. */
function CameraRig({ pointer }: { pointer: MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();

  useFrame(() => {
    const targetX = pointer.current.x * 0.5;
    const targetY = pointer.current.y * 0.3;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.04);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function HeroScene({ tier, onReady }: HeroSceneProps) {
  const pointer = useRef({ x: 0, y: 0 });
  const config = TIER_CONFIG[tier];

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <Canvas
      dpr={[1, tier === "high" ? 2 : 1.5]}
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={() => onReady?.()}
    >
      <color attach="background" args={["#05070a"]} />
      <fogExp2 attach="fog" args={["#05070a", 0.055]} />

      <ambientLight intensity={0.35} />
      <pointLight position={[4, 3, 4]} intensity={1.1} color="#45e0e8" />
      <pointLight position={[-4, -2, -3]} intensity={0.6} color="#2e7cf6" />
      <directionalLight position={[0, 4, 5]} intensity={0.25} color="#edf1f6" />

      <CameraRig pointer={pointer} />

      <Suspense fallback={null}>
        <DigitalCore pointer={pointer} detail={config.coreDetail} />
        <NetworkNodes count={config.nodes} showLabels={config.labels} />
        <Particles count={config.particles} />
      </Suspense>
    </Canvas>
  );
}
