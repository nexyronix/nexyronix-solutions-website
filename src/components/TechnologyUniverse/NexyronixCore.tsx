import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";

interface NexyronixCoreProps {
  detail?: number;
  /** True while any node is hovered/selected — dims the core slightly so the active node reads clearly. */
  dimmed?: boolean;
}

const PRIMARY = "#2e7cf6";
const CYAN = "#45e0e8";
const VIOLET = "#7c6fe8";

export function NexyronixCore({ detail = 2, dimmed = false }: NexyronixCoreProps) {
  const group = useRef<Group>(null);
  const inner = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.035;
    if (inner.current) inner.current.rotation.y -= delta * 0.06;
  });

  const shellOpacity = dimmed ? 0.18 : 0.34;
  const glowOpacity = dimmed ? 0.06 : 0.12;

  return (
    <group ref={group}>
      {/* Outer geometric shell — reads as "digital crystal / nucleus" rather than a sphere or globe */}
      <mesh>
        <octahedronGeometry args={[1.05, detail]} />
        <meshBasicMaterial color={PRIMARY} wireframe transparent opacity={shellOpacity} />
      </mesh>

      {/* Inner counter-rotating facet for depth */}
      <group ref={inner}>
        <mesh rotation={[Math.PI / 6, Math.PI / 5, 0]}>
          <icosahedronGeometry args={[0.62, Math.max(0, detail - 1)]} />
          <meshBasicMaterial color={VIOLET} wireframe transparent opacity={dimmed ? 0.16 : 0.28} />
        </mesh>
      </group>

      {/* Soft core glow */}
      <mesh>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={glowOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Fine point dust on the shell surface */}
      <CoreDust radius={1.05} count={60 + detail * 40} />

      <Html center distanceFactor={9} occlude={false}>
        <div className="pointer-events-none select-none text-center">
          <div className="font-display text-sm font-semibold tracking-[0.08em] text-text">NEXYRONIX</div>
        </div>
      </Html>
    </group>
  );
}

function CoreDust({ radius, count }: { radius: number; count: number }) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    positions[i * 3] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
  }

  return (
    <Points positions={positions} stride={3}>
      <PointMaterial transparent color={CYAN} size={0.022} sizeAttenuation depthWrite={false} opacity={0.7} />
    </Points>
  );
}
