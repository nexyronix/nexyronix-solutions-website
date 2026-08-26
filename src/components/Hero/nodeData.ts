export interface NodeConfig {
  label: string;
  position: [number, number, number];
}

const LABELS = ["WEB", "APP", "AI", "CLOUD", "DATA", "API", "SAAS"];

/** Evenly distributes `index` of `total` points across a sphere (golden-angle spiral). */
function fibonacciSphere(index: number, total: number, radius: number): [number, number, number] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = total > 1 ? 1 - (index / (total - 1)) * 2 : 0;
  const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = goldenAngle * index;
  const x = Math.cos(theta) * radiusAtY;
  const z = Math.sin(theta) * radiusAtY;
  // Flatten vertically a little so nodes read as an orbiting ring rather than a full globe
  return [x * radius, y * radius * 0.65, z * radius];
}

/** Returns the first `count` technology nodes, positioned around the core. */
export function getNetworkNodes(count: number, radius = 2.6): NodeConfig[] {
  const total = Math.min(count, LABELS.length);
  return LABELS.slice(0, total).map((label, i) => ({
    label,
    position: fibonacciSphere(i, total, radius),
  }));
}
