export type ProjectCategory =
  | "web"
  | "mobile"
  | "software"
  | "ai"
  | "saas"
  | "automation"
  | "ecommerce";

export type ProjectStatus = "concept" | "live" | "case-study";

export type ProjectVisual =
  | "dashboard"
  | "assistant"
  | "workspace"
  | "mobile"
  | "storefront"
  | "workflow";

/**
 * The full case-study shape, ready for real projects. Every field is optional
 * because a concept has none of it — and `outcome` in particular must stay
 * empty until there is verified data to put in it. Nothing in the UI invents
 * metrics; the outcome block simply doesn't render when absent.
 */
export interface CaseStudy {
  challenge?: string;
  approach?: string;
  solution?: string;
  technology?: string;
  /** Only populate with real, verified results. Renders only when present. */
  outcome?: string;
}

export interface Project {
  id: string;
  /** Display number, e.g. "01". */
  number: string;
  category: ProjectCategory;
  /** Category label shown on the card. */
  categoryLabel: string;
  title: string;
  description: string;
  technologies: string[];
  status: ProjectStatus;
  visual: ProjectVisual;
  featured?: boolean;
  caseStudy?: CaseStudy;
}

export const PROJECT_FILTERS: { id: ProjectCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "web", label: "Web" },
  { id: "mobile", label: "Mobile" },
  { id: "software", label: "Software" },
  { id: "ai", label: "AI" },
  { id: "saas", label: "SaaS" },
  { id: "automation", label: "Automation" },
  { id: "ecommerce", label: "E-Commerce" },
];

/**
 * PLACEHOLDER CONTENT.
 * Every entry below is status: "concept" — an illustration of the kind of
 * product Nexyronix can build, NOT a delivered client project. Replace these
 * with real work by changing `status` to "live" or "case-study" and filling
 * in the `caseStudy` object. Do not add outcome metrics without real data.
 */
export const PROJECTS: Project[] = [
  {
    id: "business-platform",
    number: "01",
    category: "web",
    categoryLabel: "Web Platform",
    title: "Business Digital Platform",
    description:
      "A modern web platform designed to bring business information, workflows and digital interactions into one experience.",
    technologies: ["React", "TypeScript", "Node.js", "Database"],
    status: "concept",
    visual: "dashboard",
    featured: true,
  },
  {
    id: "intelligent-assistant",
    number: "02",
    category: "ai",
    categoryLabel: "AI Application",
    title: "Intelligent Digital Assistant",
    description:
      "An AI-powered application concept designed to help users interact with information and digital workflows more efficiently.",
    technologies: ["AI", "Python", "API", "Cloud"],
    status: "concept",
    visual: "assistant",
  },
  {
    id: "management-platform",
    number: "03",
    category: "saas",
    categoryLabel: "SaaS",
    title: "Business Management Platform",
    description:
      "A SaaS concept for managing business operations through a centralized digital workspace.",
    technologies: ["React", "Node.js", "PostgreSQL", "Cloud"],
    status: "concept",
    visual: "workspace",
  },
  {
    id: "mobile-application",
    number: "04",
    category: "mobile",
    categoryLabel: "Mobile",
    title: "Mobile Application",
    description:
      "A mobile application concept focused on delivering a simple and intuitive digital experience.",
    technologies: ["Mobile", "API", "Database", "Cloud"],
    status: "concept",
    visual: "mobile",
  },
  {
    id: "commerce-experience",
    number: "05",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    title: "Digital Commerce Experience",
    description:
      "An e-commerce concept connecting products, customers, payments and business workflows through one digital experience.",
    technologies: ["Web", "E-Commerce", "API", "Database"],
    status: "concept",
    visual: "storefront",
  },
  {
    id: "workflow-system",
    number: "06",
    category: "automation",
    categoryLabel: "Automation",
    title: "Digital Workflow System",
    description:
      "An automation concept designed to connect processes, data and business workflows.",
    technologies: ["Automation", "API", "Cloud", "Data"],
    status: "concept",
    visual: "workflow",
  },
];

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  concept: "Concept",
  live: "Live",
  "case-study": "Case Study",
};

export const FEATURED_PROJECT = PROJECTS.find((p) => p.featured) ?? PROJECTS[0];
export const GRID_PROJECTS = PROJECTS.filter((p) => !p.featured);
