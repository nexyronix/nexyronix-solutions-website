import { TechIconGlyph } from "./TechIconGlyph";
import { TECH_CATEGORIES, type Technology } from "@/data/technologies";
import { cn } from "@/lib/cn";

interface TechnologyCardProps {
  technology: Technology;
  isSelected: boolean;
  /** A filter is active and this card isn't in it — kept visible but recessed. */
  isDimmed: boolean;
  onSelect: (id: string) => void;
  revealed: boolean;
  delayMs: number;
}

function categoryLabel(id: Technology["category"]) {
  return TECH_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function TechnologyCard({
  technology,
  isSelected,
  isDimmed,
  onSelect,
  revealed,
  delayMs,
}: TechnologyCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(technology.id)}
      aria-pressed={isSelected}
      aria-label={`${technology.name} — ${categoryLabel(technology.category)}. ${technology.description}`}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-xl border p-5 text-left backdrop-blur-sm",
        "transition-all duration-500 ease-signature hover:-translate-y-1 hover:border-accent-primary/50 hover:bg-surface hover:shadow-glow-primary",
        isSelected ? "border-accent-cyan/50 bg-surface" : "border-border bg-surface/40",
        isDimmed ? "opacity-40" : "opacity-100",
        revealed ? "translate-y-0" : "translate-y-4 opacity-0"
      )}
    >
      {/* Connection line that draws in on hover / selection */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-0 h-px bg-gradient-to-r from-accent-cyan to-transparent transition-all duration-500 ease-signature",
          isSelected ? "w-full" : "w-0 group-hover:w-full"
        )}
      />

      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all duration-300",
            "group-hover:scale-105",
            isSelected ? "border-accent-cyan/50 bg-accent-cyan/5" : "border-border bg-bg/50"
          )}
        >
          <TechIconGlyph icon={technology.icon} />
        </span>
        <span className="label-eyebrow shrink-0 pt-1">{categoryLabel(technology.category)}</span>
      </div>

      <h3 className="mt-4 font-display text-base font-semibold text-text">{technology.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{technology.description}</p>
    </button>
  );
}
