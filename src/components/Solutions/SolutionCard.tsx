import { cn } from "@/lib/cn";
import { SolutionVisual } from "./SolutionVisual";
import type { SolutionCategory } from "./solutionsData";

interface SolutionCardProps {
  category: SolutionCategory;
  revealed: boolean;
  delayMs: number;
  className?: string;
}

/**
 * The whole card is a semantic <a> so it's fully clickable and keyboard
 * operable. It points to an in-page anchor for now — structurally ready
 * for a real route (e.g. /solutions/websites) once detail pages exist.
 */
export function SolutionCard({ category, revealed, delayMs, className }: SolutionCardProps) {
  return (
    <a
      href="#contact"
      aria-label={`${category.title} — ${category.description}. Start a project enquiry.`}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        "group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface/60 p-6 backdrop-blur-sm",
        "transition-all duration-700 ease-signature hover:-translate-y-1 hover:border-accent-primary/50 hover:shadow-glow-primary",
        revealed ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="font-mono text-4xl font-medium text-text-faint/70 transition-colors duration-300 group-hover:text-accent-primary/70 sm:text-5xl">
          {category.number}
        </span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:border-accent-primary/60 group-hover:text-accent-primary">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4 12L12 4M12 4H5M12 4V11"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <div className="my-6 flex h-24 items-center justify-center opacity-90 transition-transform duration-500 ease-signature group-hover:scale-105 sm:h-28">
        <SolutionVisual kind={category.visual} />
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold text-text sm:text-xl">{category.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{category.description}</p>
      </div>
    </a>
  );
}
