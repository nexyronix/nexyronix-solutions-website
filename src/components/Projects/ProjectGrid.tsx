import { ProjectCard } from "./ProjectCard";
import { GRID_PROJECTS, type ProjectCategory } from "@/data/projects";
import { cn } from "@/lib/cn";

interface ProjectGridProps {
  activeCategory: ProjectCategory | "all";
  revealed: boolean;
}

/**
 * Deliberately not a uniform grid. Projects 02 and 03 sit as medium cards,
 * 04 and 05 share a row, and 06 runs full width as a horizontal case-study
 * style row — so the layout reads editorial rather than templated.
 */
const LAYOUT: Record<string, { span: string; layout: "vertical" | "horizontal" }> = {
  "intelligent-assistant": { span: "lg:col-span-7", layout: "horizontal" },
  "management-platform": { span: "lg:col-span-5", layout: "vertical" },
  "mobile-application": { span: "lg:col-span-5", layout: "vertical" },
  "commerce-experience": { span: "lg:col-span-7", layout: "horizontal" },
  "workflow-system": { span: "lg:col-span-12", layout: "horizontal" },
};

export function ProjectGrid({ activeCategory, revealed }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
      {GRID_PROJECTS.map((project, i) => {
        const config = LAYOUT[project.id] ?? { span: "lg:col-span-6", layout: "vertical" as const };
        return (
          <div key={project.id} className={cn("sm:col-span-1", config.span)}>
            <ProjectCard
              project={project}
              isDimmed={activeCategory !== "all" && project.category !== activeCategory}
              layout={config.layout}
              revealed={revealed}
              delayMs={120 + i * 70}
            />
          </div>
        );
      })}
    </div>
  );
}
