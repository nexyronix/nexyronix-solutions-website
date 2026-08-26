import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";

interface DigitalCoreProps {
  /** Normalized (-1..1) pointer position, updated by the parent scene each frame. */
  pointer: MutableRefObject<{ x: number; y: number }>;
  /** Icosahedron subdivision + point-cloud density. 0 = simplest, 2 = richest. */
  detail?: number;
}

const ACCENT_PRIMARY = "#2e7cf6";
const ACCENT_CYAN = "#45e0e8";
const ACCENT_VIOLET = "#7c6fe8";

/** Scatters `count` points just outside the wireframe shell — reads as "data nodes" on the core surface. */
function useCorePointCloud(count: number, radius: number) {
  return useMemo(() => {
    const positions = new Float32Array(count * 3);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / Math.max(1, count - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      positions[i * 3] = Math.cos(theta) * r * radius;
      positions[i * 3 + 1] = y * radius;
      positions[i * 3 + 2] = Math.sin(theta) * r * radius;
    }
    return positions;
  }, [count, radius]);
}

export function DigitalCore({ pointer, detail = 2 }: DigitalCoreProps) {
  const group = useRef<Group>(null);
  const ring1 = useRef<Group>(null);
  const ring2 = useRef<Group>(null);
  const ring3 = useRef<Group>(null);
  const autoRotate = useRef(0);
  const smoothPointer = useRef({ x: 0, y: 0 });

  const pointCount = 90 + detail * 90;
  const corePositions = useCorePointCloud(pointCount, 1.42);

  useFrame((_, delta) => {
    // Ease the raw pointer toward its target — this is what gives the core "inertia"
    smoothPointer.current.x = THREE.MathUtils.lerp(smoothPointer.current.x, pointer.current.x, 0.05);
    smoothPointer.current.y = THREE.MathUtils.lerp(smoothPointer.current.y, pointer.current.y, 0.05);
    autoRotate.current += delta * 0.05;

    if (group.current) {
      group.current.rotation.y = autoRotate.current + smoothPointer.current.x * 0.25;
      group.current.rotation.x = smoothPointer.current.y * 0.15;
    }
    if (ring1.current) ring1.current.rotation.z += delta * 0.05;
    if (ring2.current) ring2.current.rotation.x += delta * -0.04;
    if (ring3.current) ring3.current.rotation.y += delta * 0.035;
  });

  return (
    <group ref={group}>
      {/* Geodesic wireframe shell — the "neural network / infrastructure" read */}
      <mesh>
        <icosahedronGeometry args={[1.4, detail]} />
        <meshBasicMaterial color={ACCENT_PRIMARY} wireframe transparent opacity={0.32} />
      </mesh>

      {/* Soft inner glow — additive, no lighting cost */}
      <mesh>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshBasicMaterial
          color={ACCENT_CYAN}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Data-node point cloud sitting just outside the shell */}
      <Points positions={corePositions} stride={3}>
        <PointMaterial
          transparent
          color={ACCENT_CYAN}
          size={0.028}
          sizeAttenuation
          depthWrite={false}
          opacity={0.85}
        />
      </Points>

      {/* Three independently-tilted orbit rings for depth and "infrastructure" feel */}
      <group ref={ring1} rotation={[Math.PI / 2.4, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.05, 0.006, 8, 128]} />
          <meshBasicMaterial color={ACCENT_PRIMARY} transparent opacity={0.28} />
        </mesh>
      </group>
      <group ref={ring2} rotation={[Math.PI / 3, Math.PI / 5, 0]}>
        <mesh>
          <torusGeometry args={[2.35, 0.005, 8, 128]} />
          <meshBasicMaterial color={ACCENT_CYAN} transparent opacity={0.2} />
        </mesh>
      </group>
      <group ref={ring3} rotation={[-Math.PI / 4, 0, Math.PI / 6]}>
        <mesh>
          <torusGeometry args={[1.75, 0.005, 8, 128]} />
          <meshBasicMaterial color={ACCENT_VIOLET} transparent opacity={0.16} />
        </mesh>
      </group>
    </group>
  );
}
