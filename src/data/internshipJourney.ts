export interface JourneyStep {
  id: string;
  number: string;
  name: string;
  description: string;
}

export const STUDENT_JOURNEY: JourneyStep[] = [
  {
    id: "learn",
    number: "01",
    name: "Learn",
    description: "Understand tools, technologies and professional workflows.",
  },
  {
    id: "build",
    number: "02",
    name: "Build",
    description: "Apply knowledge through practical projects and tasks.",
  },
  {
    id: "collaborate",
    number: "03",
    name: "Collaborate",
    description: "Experience communication, teamwork and project workflows.",
  },
  {
    id: "experience",
    number: "04",
    name: "Experience",
    description: "Develop familiarity with real-world development environments.",
  },
  {
    id: "showcase",
    number: "05",
    name: "Showcase",
    description: "Complete projects that demonstrate practical skills.",
  },
];

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
}

export const INTERNSHIP_BENEFITS: BenefitItem[] = [
  {
    id: "practical-exposure",
    title: "Practical Exposure",
    description: "Understand how technology projects are structured.",
  },
  {
    id: "project-based",
    title: "Project-Based Learning",
    description: "Apply concepts through practical tasks and projects.",
  },
  {
    id: "modern-technologies",
    title: "Modern Technologies",
    description: "Explore relevant tools and development technologies.",
  },
  {
    id: "professional-workflow",
    title: "Professional Workflow",
    description: "Understand documentation, collaboration and development processes.",
  },
  {
    id: "multiple-domains",
    title: "Multiple Domains",
    description: "Explore opportunities across technology and business-related areas.",
  },
  {
    id: "growth-mindset",
    title: "Growth Mindset",
    description: "Develop problem-solving, communication and technical skills.",
  },
];
