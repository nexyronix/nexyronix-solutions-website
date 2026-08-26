export type DomainGroup = "technology" | "business";

export type DomainIcon =
  | "stack"
  | "layout"
  | "server"
  | "code"
  | "mobile"
  | "neural"
  | "science"
  | "analytics"
  | "cloud"
  | "pipeline"
  | "shield"
  | "design"
  | "check"
  | "database"
  | "megaphone"
  | "growth"
  | "handshake"
  | "people"
  | "finance"
  | "gears"
  | "content"
  | "kanban"
  | "research"
  | "spark";

export interface InternshipDomain {
  id: string;
  name: string;
  group: DomainGroup;
  description: string;
  /** Framed as "possible learning areas" — never a guarantee of what any given intern will do. */
  areas: string[];
  icon: DomainIcon;
}

export const INTERNSHIP_DOMAINS: InternshipDomain[] = [
  // ---- Technology ----
  {
    id: "full-stack",
    name: "Full Stack Development",
    group: "technology",
    description: "Build modern web applications across the frontend, backend and database layers.",
    areas: ["Frontend", "Backend", "APIs", "Databases", "Authentication", "Deployment"],
    icon: "stack",
  },
  {
    id: "frontend",
    name: "Frontend Development",
    group: "technology",
    description: "Create the interfaces people actually see, use and interact with.",
    areas: ["HTML & CSS", "JavaScript", "Component Frameworks", "Responsive Layouts", "State Management"],
    icon: "layout",
  },
  {
    id: "backend",
    name: "Backend Development",
    group: "technology",
    description: "Work on the server-side logic and data layer that powers applications.",
    areas: ["Server Logic", "APIs", "Databases", "Authentication", "Performance"],
    icon: "server",
  },
  {
    id: "software-development",
    name: "Software Development",
    group: "technology",
    description: "Explore how software is designed, structured and built for real requirements.",
    areas: ["Programming Fundamentals", "Software Design", "Version Control", "Debugging", "Code Review"],
    icon: "code",
  },
  {
    id: "mobile",
    name: "Mobile App Development",
    group: "technology",
    description: "Build applications designed for phones and mobile-first users.",
    areas: ["Mobile UI", "App Architecture", "APIs", "Device Features", "App Deployment"],
    icon: "mobile",
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    group: "technology",
    description: "Explore how intelligent behaviour is added to modern software products.",
    areas: ["ML Fundamentals", "Model Integration", "Data Preparation", "AI APIs", "Evaluation"],
    icon: "neural",
  },
  {
    id: "data-science",
    name: "Data Science",
    group: "technology",
    description: "Work with data to find patterns, build models and support decisions.",
    areas: ["Data Cleaning", "Statistics", "Visualization", "Modelling", "Interpretation"],
    icon: "science",
  },
  {
    id: "data-analytics",
    name: "Data Analytics",
    group: "technology",
    description: "Turn raw information into clear, usable insight for a business.",
    areas: ["Data Exploration", "Dashboards", "Reporting", "Metrics", "Visualization"],
    icon: "analytics",
  },
  {
    id: "cloud",
    name: "Cloud Computing",
    group: "technology",
    description: "Understand how applications are hosted, scaled and run in the cloud.",
    areas: ["Cloud Fundamentals", "Hosting", "Storage", "Scaling", "Configuration"],
    icon: "cloud",
  },
  {
    id: "devops",
    name: "DevOps",
    group: "technology",
    description: "Explore how code moves reliably from a developer's machine into production.",
    areas: ["Version Control", "CI/CD Concepts", "Environments", "Automation", "Monitoring"],
    icon: "pipeline",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    group: "technology",
    description: "Learn how digital systems are protected and why secure design matters.",
    areas: ["Security Fundamentals", "Common Vulnerabilities", "Secure Practices", "Access Control", "Awareness"],
    icon: "shield",
  },
  {
    id: "ui-ux",
    name: "UI/UX Design",
    group: "technology",
    description: "Shape how a product looks, feels and guides the people using it.",
    areas: ["User Research", "Wireframing", "Interface Design", "Prototyping", "Design Systems"],
    icon: "design",
  },
  {
    id: "testing",
    name: "Software Testing",
    group: "technology",
    description: "Understand how software is checked for correctness and reliability before release.",
    areas: ["Test Cases", "Functional Testing", "Bug Reporting", "Regression", "Quality Practices"],
    icon: "check",
  },
  {
    id: "database",
    name: "Database Development",
    group: "technology",
    description: "Work with how information is structured, stored and queried.",
    areas: ["Data Modelling", "Queries", "Relationships", "Indexing", "Data Integrity"],
    icon: "database",
  },

  // ---- Business & other ----
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    group: "business",
    description: "Explore how technology products reach and engage the right audience.",
    areas: ["Content Strategy", "Social Channels", "SEO Basics", "Campaigns", "Analytics"],
    icon: "megaphone",
  },
  {
    id: "business-development",
    name: "Business Development",
    group: "business",
    description: "Understand how technology companies identify and develop opportunities.",
    areas: ["Market Research", "Outreach", "Proposals", "Client Understanding", "Growth Planning"],
    icon: "growth",
  },
  {
    id: "sales",
    name: "Sales",
    group: "business",
    description: "Learn how solutions are communicated, positioned and matched to real needs.",
    areas: ["Prospecting", "Communication", "Requirement Discovery", "Follow-up", "CRM Basics"],
    icon: "handshake",
  },
  {
    id: "hr",
    name: "Human Resources",
    group: "business",
    description: "Explore how teams are built, supported and organized.",
    areas: ["Recruitment Support", "Coordination", "Documentation", "Onboarding", "Communication"],
    icon: "people",
  },
  {
    id: "finance",
    name: "Finance",
    group: "business",
    description: "Understand the financial side of running a technology business.",
    areas: ["Budgeting Basics", "Record Keeping", "Reporting", "Analysis", "Documentation"],
    icon: "finance",
  },
  {
    id: "operations",
    name: "Operations",
    group: "business",
    description: "See how the day-to-day work of a company is coordinated and improved.",
    areas: ["Process Understanding", "Coordination", "Documentation", "Tracking", "Improvement"],
    icon: "gears",
  },
  {
    id: "content",
    name: "Content & Communication",
    group: "business",
    description: "Work on how a technology company explains itself clearly.",
    areas: ["Writing", "Editing", "Technical Communication", "Documentation", "Tone & Clarity"],
    icon: "content",
  },
  {
    id: "project-management",
    name: "Project Management",
    group: "business",
    description: "Understand how work is planned, tracked and delivered.",
    areas: ["Planning", "Task Tracking", "Coordination", "Timelines", "Reporting"],
    icon: "kanban",
  },
  {
    id: "research",
    name: "Research",
    group: "business",
    description: "Investigate technologies, markets and problems worth solving.",
    areas: ["Information Gathering", "Comparison", "Documentation", "Analysis", "Presentation"],
    icon: "research",
  },
  {
    id: "entrepreneurship",
    name: "Entrepreneurship",
    group: "business",
    description: "Explore how ideas become products and products become businesses.",
    areas: ["Idea Validation", "Problem Framing", "Product Thinking", "Planning", "Presentation"],
    icon: "spark",
  },
];

export const DOMAIN_GROUPS: { id: DomainGroup; label: string }[] = [
  { id: "technology", label: "Technology" },
  { id: "business", label: "Business & Other Domains" },
];
