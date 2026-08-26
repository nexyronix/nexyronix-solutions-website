export interface TechNode {
  id: string;
  label: string;
  description: string;
  position: [number, number, number];
}

interface RawNode {
  id: string;
  label: string;
  description: string;
}

// Ordered by priority — low device tiers slice from the front, so the most
// representative capabilities (Web, Applications, AI, Cloud, Data, SaaS)
// survive the cut before Software/APIs/Automation/Security.
const RAW_NODES: RawNode[] = [
  { id: "web", label: "WEB", description: "Websites and digital experiences." },
  { id: "applications", label: "APPLICATIONS", description: "Web and mobile applications." },
  { id: "ai", label: "AI", description: "Artificial intelligence and intelligent applications." },
  { id: "cloud", label: "CLOUD", description: "Cloud-based platforms and infrastructure." },
  { id: "data", label: "DATA", description: "Databases, analytics and information systems." },
  { id: "saas", label: "SAAS", description: "Cloud software products and platforms." },
  { id: "software", label: "SOFTWARE", description: "Custom business software." },
  { id: "apis", label: "APIs", description: "Integrations and backend connectivity." },
  { id: "automation", label: "AUTOMATION", description: "Connected workflows and process automation." },
  { id: "security", label: "SECURITY", description: "Security-aware digital architecture and responsible technology practices." },
];

/** Evenly distributes `index` of `total` points across a flattened sphere (golden-angle spiral). */
function fibonacciSphere(index: number, total: number, radius: number): [number, number, number] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = total > 1 ? 1 - (index / (total - 1)) * 2 : 0;
  const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = goldenAngle * index;
  const x = Math.cos(theta) * radiusAtY;
  const z = Math.sin(theta) * radiusAtY;
  return [x * radius, y * radius * 0.55, z * radius];
}

const ALL_NODES: TechNode[] = RAW_NODES.map((node, i) => ({
  ...node,
  position: fibonacciSphere(i, RAW_NODES.length, 3.4),
}));

/** Returns the first `count` technology nodes (priority-ordered). */
export function getTechNodes(count: number): TechNode[] {
  return ALL_NODES.slice(0, Math.min(count, ALL_NODES.length));
}

/** Secondary node-to-node links, by id. Only rendered when both ids are present in the active node set. */
export const SECONDARY_CONNECTIONS: [string, string][] = [
  ["ai", "data"],
  ["web", "apis"],
  ["applications", "apis"],
  ["saas", "cloud"],
  ["automation", "apis"],
];

/** Ids of nodes secondarily linked to `activeId`. Empty set when nothing is active. */
export function connectedIdsOf(activeId: string | null): Set<string> {
  if (!activeId) return new Set();
  const linked = new Set<string>();
  for (const [a, b] of SECONDARY_CONNECTIONS) {
    if (a === activeId) linked.add(b);
    if (b === activeId) linked.add(a);
  }
  return linked;
}
