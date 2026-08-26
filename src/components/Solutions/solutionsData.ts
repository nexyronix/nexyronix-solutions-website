export type SolutionVisualKind =
  | "websites"
  | "applications"
  | "custom-software"
  | "ai"
  | "saas"
  | "automation"
  | "data-apis"
  | "ecommerce";

export interface SolutionCategory {
  id: string;
  number: string;
  title: string;
  description: string;
  /** Kept for future detail views — not rendered on the card face. */
  examples: string[];
  visual: SolutionVisualKind;
}

export const SOLUTIONS: SolutionCategory[] = [
  {
    id: "websites",
    number: "01",
    title: "Websites",
    description:
      "Modern digital experiences built to represent brands, products and organizations.",
    examples: ["Corporate websites", "Landing pages", "Business websites", "Portals", "Digital experiences"],
    visual: "websites",
  },
  {
    id: "applications",
    number: "02",
    title: "Applications",
    description: "Scalable web and mobile applications designed around users and real workflows.",
    examples: [
      "Web applications",
      "Mobile applications",
      "Customer portals",
      "Internal applications",
      "Platform development",
    ],
    visual: "applications",
  },
  {
    id: "custom-software",
    number: "03",
    title: "Custom Software",
    description: "Purpose-built software designed around specific business requirements.",
    examples: [
      "Business software",
      "Management systems",
      "Workflow platforms",
      "Internal tools",
      "Enterprise applications",
    ],
    visual: "custom-software",
  },
  {
    id: "ai-solutions",
    number: "04",
    title: "AI Solutions",
    description:
      "Intelligent applications and AI-powered workflows designed to make technology more capable.",
    examples: [
      "AI applications",
      "AI integrations",
      "Intelligent assistants",
      "AI automation",
      "Machine learning solutions",
    ],
    visual: "ai",
  },
  {
    id: "saas",
    number: "05",
    title: "SaaS",
    description: "Cloud-based software products designed for scalable digital businesses.",
    examples: ["SaaS platforms", "Subscription applications", "Multi-user systems", "Cloud software"],
    visual: "saas",
  },
  {
    id: "automation",
    number: "06",
    title: "Automation",
    description: "Technology that reduces repetitive work and improves operational efficiency.",
    examples: [
      "Workflow automation",
      "Business process automation",
      "API automation",
      "Data workflows",
      "System integrations",
    ],
    visual: "automation",
  },
  {
    id: "data-apis",
    number: "07",
    title: "Data & APIs",
    description: "The infrastructure behind reliable digital products.",
    examples: ["REST APIs", "Backend systems", "Database systems", "Third-party integrations", "Data processing"],
    visual: "data-apis",
  },
  {
    id: "ecommerce",
    number: "08",
    title: "E-Commerce",
    description: "Modern commerce platforms designed to connect businesses with customers.",
    examples: ["Online stores", "Product platforms", "Payment integrations", "Order management", "Customer systems"],
    visual: "ecommerce",
  },
];
