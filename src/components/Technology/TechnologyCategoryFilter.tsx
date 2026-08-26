import { TECH_CATEGORIES, type TechCategoryId } from "@/data/technologies";
import { cn } from "@/lib/cn";

interface TechnologyCategoryFilterProps {
  active: TechCategoryId | "all";
  onChange: (category: TechCategoryId | "all") => void;
  className?: string;
}

export function TechnologyCategoryFilter({ active, onChange, className }: TechnologyCategoryFilterProps) {
  const options: { id: TechCategoryId | "all"; label: string }[] = [
    { id: "all", label: "All" },
    ...TECH_CATEGORIES,
  ];

  return (
    <div
      role="tablist"
      aria-label="Technology categories"
      className={cn("flex gap-2 overflow-x-auto pb-2", className)}
    >
      {options.map((option) => {
        const isActive = option.id === active;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-pill border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-200",
              isActive
                ? "border-accent-cyan/60 bg-surface text-text"
                : "border-border text-text-muted hover:border-border-strong hover:text-text"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
