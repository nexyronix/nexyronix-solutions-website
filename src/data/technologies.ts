export type TechCategoryId =
  | "frontend"
  | "backend"
  | "database"
  | "cloud"
  | "ai-data"
  | "devops";

export type TechIcon =
  | "react"
  | "next"
  | "js"
  | "ts"
  | "html"
  | "css"
  | "tailwind"
  | "node"
  | "python"
  | "java"
  | "php"
  | "api"
  | "postgres"
  | "mysql"
  | "mongo"
  | "redis"
  | "aws"
  | "azure"
  | "gcp"
  | "ml"
  | "genai"
  | "aiapi"
  | "analytics"
  | "git"
  | "github"
  | "docker"
  | "cicd"
  | "three";

export interface TechCategory {
  id: TechCategoryId;
  label: string;
}

export const TECH_CATEGORIES: TechCategory[] = [
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "database", label: "Database" },
  { id: "cloud", label: "Cloud" },
  { id: "ai-data", label: "AI & Data" },
  { id: "devops", label: "DevOps" },
];

export interface Technology {
  id: string;
  name: string;
  category: TechCategoryId;
  description: string;
  icon: TechIcon;
  /** Appears in the "Selected Technologies" row. */
  featured?: boolean;
  /**
   * The chain shown when this technology is selected, e.g.
   * React → Frontend → Applications → Nexyronix.
   * Stored as plain labels so it stays easy to edit.
   */
  connections: string[];
}

export const TECHNOLOGIES: Technology[] = [
  // ---- Frontend ----
  {
    id: "react",
    name: "React",
    category: "frontend",
    description: "A component-based library for building modern interactive interfaces.",
    icon: "react",
    featured: true,
    connections: ["Frontend", "Applications", "Nexyronix"],
  },
  {
    id: "nextjs",
    name: "Next.js",
    category: "frontend",
    description: "A React framework for production sites with routing and rendering built in.",
    icon: "next",
    connections: ["Frontend", "Applications", "Nexyronix"],
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "frontend",
    description: "The language of the web, powering behaviour in the browser.",
    icon: "js",
    connections: ["Frontend", "Applications", "Nexyronix"],
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "frontend",
    description: "JavaScript with static types, for safer and more maintainable code.",
    icon: "ts",
    featured: true,
    connections: ["Frontend", "Applications", "Nexyronix"],
  },
  {
    id: "html",
    name: "HTML",
    category: "frontend",
    description: "The structural foundation of every web page.",
    icon: "html",
    connections: ["Frontend", "Applications", "Nexyronix"],
  },
  {
    id: "css",
    name: "CSS",
    category: "frontend",
    description: "Styling and layout for interfaces across every screen size.",
    icon: "css",
    connections: ["Frontend", "Applications", "Nexyronix"],
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    category: "frontend",
    description: "A utility-first CSS framework for building consistent design systems.",
    icon: "tailwind",
    connections: ["Frontend", "Applications", "Nexyronix"],
  },
  {
    id: "threejs",
    name: "Three.js",
    category: "frontend",
    description: "A 3D graphics library for interactive experiences in the browser.",
    icon: "three",
    featured: true,
    connections: ["Frontend", "Applications", "Nexyronix"],
  },

  // ---- Backend ----
  {
    id: "nodejs",
    name: "Node.js",
    category: "backend",
    description: "JavaScript on the server, for APIs and real-time services.",
    icon: "node",
    featured: true,
    connections: ["Backend", "Applications", "Nexyronix"],
  },
  {
    id: "python-backend",
    name: "Python",
    category: "backend",
    description: "A versatile language used across services, automation and data work.",
    icon: "python",
    featured: true,
    connections: ["Backend", "Applications", "Nexyronix"],
  },
  {
    id: "java",
    name: "Java",
    category: "backend",
    description: "A long-established language for robust, large-scale applications.",
    icon: "java",
    connections: ["Backend", "Applications", "Nexyronix"],
  },
  {
    id: "php",
    name: "PHP",
    category: "backend",
    description: "A widely used server-side language for web platforms.",
    icon: "php",
    connections: ["Backend", "Applications", "Nexyronix"],
  },
  {
    id: "rest-apis",
    name: "REST APIs",
    category: "backend",
    description: "The connective layer between applications, services and data.",
    icon: "api",
    connections: ["Backend", "Applications", "Nexyronix"],
  },

  // ---- Database ----
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "database",
    description: "A powerful relational database for structured, reliable data.",
    icon: "postgres",
    featured: true,
    connections: ["Database", "Backend", "Applications", "Nexyronix"],
  },
  {
    id: "mysql",
    name: "MySQL",
    category: "database",
    description: "A widely adopted relational database for web applications.",
    icon: "mysql",
    connections: ["Database", "Backend", "Applications", "Nexyronix"],
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "database",
    description: "A document database for flexible, evolving data structures.",
    icon: "mongo",
    connections: ["Database", "Backend", "Applications", "Nexyronix"],
  },
  {
    id: "redis",
    name: "Redis",
    category: "database",
    description: "An in-memory store used for caching and fast lookups.",
    icon: "redis",
    connections: ["Database", "Backend", "Applications", "Nexyronix"],
  },

  // ---- Cloud ----
  {
    id: "aws",
    name: "AWS",
    category: "cloud",
    description: "Cloud infrastructure for hosting, storage and scaling.",
    icon: "aws",
    connections: ["Cloud", "SaaS", "Applications", "Nexyronix"],
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    category: "cloud",
    description: "Microsoft's cloud platform for applications and services.",
    icon: "azure",
    connections: ["Cloud", "SaaS", "Applications", "Nexyronix"],
  },
  {
    id: "gcp",
    name: "Google Cloud",
    category: "cloud",
    description: "Google's cloud platform for compute, data and AI workloads.",
    icon: "gcp",
    connections: ["Cloud", "SaaS", "Applications", "Nexyronix"],
  },

  // ---- AI & Data ----
  {
    id: "python-ai",
    name: "Python",
    category: "ai-data",
    description: "The primary language for data work and machine learning.",
    icon: "python",
    connections: ["AI & Data", "Applications", "Nexyronix"],
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    category: "ai-data",
    description: "Models that learn patterns from data to support decisions.",
    icon: "ml",
    connections: ["AI & Data", "Applications", "Nexyronix"],
  },
  {
    id: "generative-ai",
    name: "Generative AI",
    category: "ai-data",
    description: "Models that generate text, code and content within products.",
    icon: "genai",
    connections: ["AI & Data", "Applications", "Nexyronix"],
  },
  {
    id: "ai-apis",
    name: "AI APIs",
    category: "ai-data",
    description: "Hosted model services integrated into applications.",
    icon: "aiapi",
    connections: ["AI & Data", "Backend", "Applications", "Nexyronix"],
  },
  {
    id: "data-analytics",
    name: "Data Analytics",
    category: "ai-data",
    description: "Turning collected data into dashboards and usable insight.",
    icon: "analytics",
    connections: ["AI & Data", "Database", "Applications", "Nexyronix"],
  },

  // ---- DevOps ----
  {
    id: "git",
    name: "Git",
    category: "devops",
    description: "Version control that tracks every change in a codebase.",
    icon: "git",
    connections: ["DevOps", "Applications", "Nexyronix"],
  },
  {
    id: "github",
    name: "GitHub",
    category: "devops",
    description: "Hosted repositories, code review and collaboration.",
    icon: "github",
    connections: ["DevOps", "Applications", "Nexyronix"],
  },
  {
    id: "docker",
    name: "Docker",
    category: "devops",
    description: "Containers that make environments consistent everywhere.",
    icon: "docker",
    connections: ["DevOps", "Cloud", "Applications", "Nexyronix"],
  },
  {
    id: "cicd",
    name: "CI/CD",
    category: "devops",
    description: "Automated pipelines that build, test and release code.",
    icon: "cicd",
    connections: ["DevOps", "Cloud", "Applications", "Nexyronix"],
  },
];

/** Technologies shown in the "Selected Technologies" row, in display order. */
export const FEATURED_TECHNOLOGIES = TECHNOLOGIES.filter((t) => t.featured);
