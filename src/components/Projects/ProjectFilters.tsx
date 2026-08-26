import { PROJECT_FILTERS, type ProjectCategory } from "@/data/projects";
import { cn } from "@/lib/cn";

interface ProjectFiltersProps {
  active: ProjectCategory | "all";
  onChange: (category: ProjectCategory | "all") => void;
  className?: string;
}

export function ProjectFilters({ active, onChange, className }: ProjectFiltersProps) {
  return (
    <div
      role="tablist"
      aria-label="Project categories"
      className={cn("flex gap-2 overflow-x-auto pb-2", className)}
    >
      {PROJECT_FILTERS.map((filter) => {
        const isActive = filter.id === active;
        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter.id)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-pill border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-200",
              isActive
                ? "border-accent-cyan/60 bg-surface text-text"
                : "border-border text-text-muted hover:border-border-strong hover:text-text"
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
