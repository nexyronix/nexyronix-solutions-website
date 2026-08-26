import { ProjectVisual } from "./ProjectVisual";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { cn } from "@/lib/cn";
import type { Project } from "@/data/projects";

interface FeaturedProjectProps {
  project: Project;
  revealed: boolean;
}

export function FeaturedProject({ project, revealed }: FeaturedProjectProps) {
  return (
    <article
      aria-label={`${project.title} — ${project.categoryLabel}. Concept project.`}
      className={cn(
        "group relative grid overflow-hidden rounded-2xl border border-border bg-surface/40 backdrop-blur-sm lg:grid-cols-12",
        "transition-all duration-700 ease-signature hover:border-accent-primary/50 hover:shadow-glow-primary",
        revealed ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      )}
    >
      {/* Large mockup */}
      <div className="relative overflow-hidden border-b border-border bg-bg/50 lg:col-span-7 lg:border-b-0 lg:border-r">
        <div className="pointer-events-none absolute inset-0 bg-grid-overlay bg-grid opacity-[0.06]" />
        <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
        <div className="relative flex h-full items-center justify-center p-6 transition-transform duration-700 ease-signature group-hover:scale-[1.02] sm:p-10">
          <ProjectVisual kind={project.visual} variant="featured" />
        </div>
        <ProjectStatusBadge status={project.status} size="md" className="absolute left-5 top-5" />
      </div>

      {/* Editorial body */}
      <div className="flex flex-col justify-center p-7 sm:p-10 lg:col-span-5">
        <span className="label-eyebrow">
          {project.number} — {project.categoryLabel}
        </span>

        <h3 className="mt-5 font-display text-display-sm font-semibold uppercase leading-tight text-text">
          {project.title}
        </h3>

        <p className="mt-4 text-base leading-relaxed text-text-muted">{project.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-pill border border-border bg-bg/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted"
            >
              {tech}
            </span>
          ))}
        </div>

        <a
          href="#contact"
          className="group/btn mt-8 inline-flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-cyan transition-colors duration-200 hover:text-text"
        >
          Discuss a project like this
          <ArrowIcon />
        </a>
      </div>
    </article>
  );
}
