/**
 * FACTUAL COMPANY DATA ONLY.
 *
 * Everything here comes from what has actually been stated about Nexyronix.
 * Do NOT add: founder biographies, employee details, awards, certifications,
 * partnerships, client relationships, testimonials, achievements, founding
 * dates, headcount, project counts, revenue, student numbers, or years of
 * experience — none of that has been provided, and inventing it would make
 * the site untruthful.
 */

export interface CompanyFact {
  label: string;
  value: string;
}

export const COMPANY_FACTS: CompanyFact[] = [
  { label: "Company", value: "Nexyronix Solutions Private Limited" },
  { label: "Focus", value: "Software & Digital Solutions" },
  { label: "Additional Focus", value: "Student Internship Opportunities" },
];

export const COMPANY_STORY = {
  headline: "Built around technology. Driven by possibility.",
  paragraphs: [
    "Nexyronix exists to build useful technology that helps businesses, organizations and individuals turn ideas and requirements into practical digital solutions.",
    "Our work spans websites, applications, custom software, AI-powered solutions, automation, cloud technologies and other digital products.",
    "Alongside building technology, Nexyronix creates internship opportunities for students from universities and colleges across multiple domains, helping them gain exposure to practical projects, tools and professional workflows.",
  ],
};

export interface Pillar {
  id: string;
  name: string;
  description: string;
}

export const COMPANY_PILLARS: Pillar[] = [
  { id: "build", name: "Build", description: "Create useful digital products." },
  { id: "solve", name: "Solve", description: "Use technology to address real problems." },
  { id: "learn", name: "Learn", description: "Keep exploring technologies and ideas." },
  { id: "evolve", name: "Evolve", description: "Continuously improve products and capabilities." },
];

export const MISSION = {
  label: "Our Mission",
  heading: "Build technology that matters.",
  body: "Our mission is to create useful, reliable and adaptable digital solutions that help solve real-world problems and create new possibilities.",
};

export const VISION = {
  label: "Our Vision",
  heading: "Building the digital future.",
  body: "We envision Nexyronix growing into a trusted technology ecosystem that connects digital products, businesses, institutions and emerging talent.",
};

/** The four stages of the company-evolution visual. */
export const EVOLUTION_STAGES = ["Idea", "Build", "Connect", "Grow"];
