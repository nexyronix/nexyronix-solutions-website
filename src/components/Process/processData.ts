export interface ProcessStageData {
  id: string;
  number: string;
  name: string;
  statement: string;
  description: string;
  activities: string[];
}

export const PROCESS_STAGES: ProcessStageData[] = [
  {
    id: "discover",
    number: "01",
    name: "Discover",
    statement: "Understand before we build.",
    description: "Understand the idea, problem, users, requirements and objectives.",
    activities: ["Requirements", "Goals", "Users", "Challenges", "Scope"],
  },
  {
    id: "design",
    number: "02",
    name: "Design",
    statement: "Turn ideas into experiences.",
    description: "Create the product structure, user experience, interface and technical direction.",
    activities: ["User Experience", "Interface", "Architecture", "Product Flow"],
  },
  {
    id: "develop",
    number: "03",
    name: "Develop",
    statement: "Build the technology.",
    description: "Develop the application using appropriate modern technologies and engineering practices.",
    activities: ["Frontend", "Backend", "APIs", "Database", "Integrations"],
  },
  {
    id: "test",
    number: "04",
    name: "Test",
    statement: "Make it reliable.",
    description: "Test functionality, usability, performance and reliability before release.",
    activities: ["Functional Testing", "Compatibility", "Performance", "Error Handling", "Quality Checks"],
  },
  {
    id: "deploy",
    number: "05",
    name: "Deploy",
    statement: "Take it into the real world.",
    description: "Prepare and deploy the solution into its production environment.",
    activities: ["Deployment", "Configuration", "Infrastructure", "Monitoring"],
  },
  {
    id: "evolve",
    number: "06",
    name: "Evolve",
    statement: "Technology keeps moving.",
    description: "Continue improving the product based on feedback, changing requirements and future opportunities.",
    activities: ["Improvements", "New Features", "Optimization", "Maintenance", "Scaling"],
  },
];
