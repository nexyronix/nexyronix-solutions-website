export type IndustryGlyph =
  | "launch"
  | "modules"
  | "infrastructure"
  | "learn"
  | "campus"
  | "pulse"
  | "storefront"
  | "commerce"
  | "chart"
  | "hex"
  | "route"
  | "building"
  | "flow"
  | "pin"
  | "columns"
  | "cluster";

export interface Industry {
  id: string;
  name: string;
  description: string;
  solutions: string[];
  /** Connected technologies — drawn from the same vocabulary as the Phase 4 Technology Universe. */
  technologies: string[];
  glyph: IndustryGlyph;
}

export const INDUSTRIES: Industry[] = [
  {
    id: "startups",
    name: "Startups",
    description: "Websites, MVPs, SaaS products, dashboards, automation and custom software.",
    solutions: ["Websites", "MVPs", "SaaS Products", "Dashboards", "Automation"],
    technologies: ["WEB", "APPLICATIONS", "SAAS", "AUTOMATION", "SOFTWARE"],
    glyph: "launch",
  },
  {
    id: "smb",
    name: "Small & Medium Businesses",
    description: "Business websites, management systems, workflow automation and digital tools.",
    solutions: ["Business Websites", "Management Systems", "Workflow Automation", "Digital Tools"],
    technologies: ["WEB", "SOFTWARE", "AUTOMATION", "CLOUD", "DATA"],
    glyph: "modules",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom applications, integrations, internal platforms and scalable software.",
    solutions: ["Custom Applications", "Integrations", "Internal Platforms", "Scalable Software"],
    technologies: ["SOFTWARE", "APIS", "CLOUD", "DATA", "SECURITY"],
    glyph: "infrastructure",
  },
  {
    id: "education",
    name: "Education",
    description: "Educational platforms, portals, management systems and digital learning tools.",
    solutions: [
      "Student Portals",
      "Learning Platforms",
      "Management Systems",
      "Institution Websites",
      "Communication Platforms",
      "Analytics Dashboards",
    ],
    technologies: ["WEB", "APPLICATIONS", "DATA", "CLOUD", "AI", "APIS"],
    glyph: "learn",
  },
  {
    id: "universities",
    name: "Universities & Colleges",
    description: "Student platforms, portals, workflow systems and institutional applications.",
    solutions: ["Student Platforms", "Portals", "Workflow Systems", "Institutional Applications"],
    technologies: ["WEB", "APPLICATIONS", "DATA", "CLOUD", "AUTOMATION"],
    glyph: "campus",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Digital workflows, appointment systems, portals and administrative software.",
    solutions: ["Digital Workflows", "Appointment Systems", "Portals", "Administrative Software"],
    technologies: ["APPLICATIONS", "SOFTWARE", "DATA", "CLOUD", "SECURITY"],
    glyph: "pulse",
  },
  {
    id: "retail",
    name: "Retail",
    description: "Inventory, customer platforms, e-commerce and business management solutions.",
    solutions: ["Inventory Systems", "Customer Platforms", "E-Commerce", "Business Management"],
    technologies: ["WEB", "APPLICATIONS", "DATA", "APIS", "AUTOMATION"],
    glyph: "storefront",
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    description: "Online stores, commerce platforms, payment integrations and order systems.",
    solutions: ["Online Stores", "Commerce Platforms", "Payment Integrations", "Order Systems"],
    technologies: ["WEB", "APPLICATIONS", "DATA", "APIS", "SAAS"],
    glyph: "commerce",
  },
  {
    id: "finance",
    name: "Finance",
    description: "Business dashboards, workflow software, data systems and digital platforms.",
    solutions: ["Business Dashboards", "Workflow Software", "Data Systems", "Digital Platforms"],
    technologies: ["SOFTWARE", "DATA", "CLOUD", "SECURITY", "APIS"],
    glyph: "chart",
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    description: "Operational software, dashboards, inventory workflows and automation.",
    solutions: ["Operational Software", "Dashboards", "Inventory Workflows", "Automation"],
    technologies: ["SOFTWARE", "AUTOMATION", "DATA", "APIS", "CLOUD"],
    glyph: "hex",
  },
  {
    id: "logistics",
    name: "Logistics",
    description: "Tracking interfaces, workflow systems, management software and integrations.",
    solutions: ["Tracking Interfaces", "Workflow Systems", "Management Software", "Integrations"],
    technologies: ["SOFTWARE", "AUTOMATION", "DATA", "APIS", "CLOUD"],
    glyph: "route",
  },
  {
    id: "real-estate",
    name: "Real Estate",
    description: "Property platforms, portals, management systems and lead workflows.",
    solutions: ["Property Platforms", "Portals", "Management Systems", "Lead Workflows"],
    technologies: ["WEB", "APPLICATIONS", "DATA", "CLOUD"],
    glyph: "building",
  },
  {
    id: "professional-services",
    name: "Professional Services",
    description: "Websites, client portals, workflow tools and business software.",
    solutions: ["Websites", "Client Portals", "Workflow Tools", "Business Software"],
    technologies: ["WEB", "APPLICATIONS", "SOFTWARE", "AUTOMATION"],
    glyph: "flow",
  },
  {
    id: "hospitality",
    name: "Hospitality",
    description: "Websites, booking-related interfaces, management tools and customer experiences.",
    solutions: ["Websites", "Booking Interfaces", "Management Tools", "Customer Experiences"],
    technologies: ["WEB", "APPLICATIONS", "CLOUD", "AUTOMATION"],
    glyph: "pin",
  },
  {
    id: "government",
    name: "Government & Institutions",
    description: "Digital portals, workflow systems and institutional software.",
    solutions: ["Digital Portals", "Workflow Systems", "Institutional Software"],
    technologies: ["SOFTWARE", "SECURITY", "DATA", "CLOUD"],
    glyph: "columns",
  },
  {
    id: "ngo",
    name: "NGOs & Social Organizations",
    description: "Websites, donation-related platforms, management systems and digital workflows.",
    solutions: ["Websites", "Donation Platforms", "Management Systems", "Digital Workflows"],
    technologies: ["WEB", "APPLICATIONS", "SAAS", "AUTOMATION"],
    glyph: "cluster",
  },
];
