export type ValueIcon =
  | "innovation"
  | "integrity"
  | "quality"
  | "learning"
  | "collaboration"
  | "customer-focus";

export interface CompanyValue {
  id: string;
  name: string;
  description: string;
  icon: ValueIcon;
}

export const COMPANY_VALUES: CompanyValue[] = [
  {
    id: "innovation",
    name: "Innovation",
    description: "Explore new ideas and technologies.",
    icon: "innovation",
  },
  {
    id: "integrity",
    name: "Integrity",
    description: "Build with honesty, responsibility and transparency.",
    icon: "integrity",
  },
  {
    id: "quality",
    name: "Quality",
    description: "Focus on reliable and maintainable solutions.",
    icon: "quality",
  },
  {
    id: "learning",
    name: "Learning",
    description: "Keep learning, experimenting and improving.",
    icon: "learning",
  },
  {
    id: "collaboration",
    name: "Collaboration",
    description: "Build better outcomes through teamwork.",
    icon: "collaboration",
  },
  {
    id: "customer-focus",
    name: "Customer Focus",
    description: "Understand the problem before designing the solution.",
    icon: "customer-focus",
  },
];
