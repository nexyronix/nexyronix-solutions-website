import { ProjectVisual } from "./ProjectVisual";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { cn } from "@/lib/cn";
import type { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
  /** Filtered out by the current category — recessed rather than unmounted. */
  isDimmed: boolean;
  /** Horizontal layout for the wide case-study-style rows. */
  layout?: "vertical" | "horizontal";
  revealed: boolean;
  delayMs: number;
}

export function ProjectCard({
  project,
  isDimmed,
  layout = "vertical",
  revealed,
  delayMs,
}: ProjectCardProps) {
  const isHorizontal = layout === "horizontal";

  return (
    <article
      aria-label={`${project.title} — ${project.categoryLabel}. Concept placeholder.`}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        "group relative flex overflow-hidden rounded-xl border border-border bg-surface/40 backdrop-blur-sm",
        "transition-all duration-500 ease-signature hover:-translate-y-1 hover:border-accent-primary/50 hover:bg-surface hover:shadow-glow-primary",
        isHorizontal ? "flex-col sm:flex-row" : "flex-col",
        isDimmed ? "opacity-40" : "opacity-100",
        revealed ? "translate-y-0" : "translate-y-4 opacity-0"
      )}
    >
      {/* Visual */}
      <div
        className={cn(
          "relative overflow-hidden border-border bg-bg/40",
          isHorizontal ? "border-b sm:w-2/5 sm:border-b-0 sm:border-r" : "border-b"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-grid-overlay bg-grid opacity-[0.05]" />
        <div className="relative transition-transform duration-700 ease-signature group-hover:scale-[1.03]">
          <ProjectVisual kind={project.visual} />
        </div>
        <ProjectStatusBadge status={project.status} className="absolute left-3 top-3" />
      </div>

      {/* Body */}
      <div className={cn("flex flex-1 flex-col p-5", isHorizontal && "sm:p-6")}>
        <div className="flex items-center justify-between gap-3">
          <span className="label-eyebrow">
            {project.number} — {project.categoryLabel}
          </span>
        </div>

        <h4
          className={cn(
            "mt-3 font-display font-semibold text-text",
            isHorizontal ? "text-lg sm:text-xl" : "text-base"
          )}
        >
          {project.title}
        </h4>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">{project.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-pill border border-border bg-bg/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
