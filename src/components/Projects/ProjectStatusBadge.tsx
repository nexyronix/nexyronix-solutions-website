import { STATUS_LABEL, type ProjectStatus } from "@/data/projects";
import { cn } from "@/lib/cn";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Single source of truth for how a project's status is displayed. Concepts are
 * labelled unambiguously so a placeholder can never be mistaken for delivered
 * client work.
 */
export function ProjectStatusBadge({ status, size = "sm", className }: ProjectStatusBadgeProps) {
  const isConcept = status === "concept";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border font-mono uppercase tracking-[0.14em] backdrop-blur-sm",
        size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs",
        isConcept
          ? "border-accent-violet/40 bg-accent-violet/10 text-accent-violet"
          : "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan",
        className
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", isConcept ? "bg-accent-violet" : "bg-accent-cyan")}
        aria-hidden="true"
      />
      {isConcept ? "Concept / Placeholder" : STATUS_LABEL[status]}
    </span>
  );
}
