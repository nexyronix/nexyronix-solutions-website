import { TechIconGlyph } from "./TechIconGlyph";
import { TECH_CATEGORIES, type Technology } from "@/data/technologies";

interface TechnologyDetailsProps {
  technology: Technology;
}

export function TechnologyDetails({ technology }: TechnologyDetailsProps) {
  const categoryLabel =
    TECH_CATEGORIES.find((c) => c.id === technology.category)?.label ?? technology.category;

  // The full chain as displayed: the technology itself, then its path to the core.
  const chain = [technology.name, ...technology.connections];

  return (
    <div
      aria-live="polite"
      className="rounded-xl border border-accent-cyan/30 bg-surface/70 p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent-cyan/50 bg-accent-cyan/5">
          <TechIconGlyph icon={technology.icon} />
        </span>
        <div>
          <h4 className="font-display text-lg font-semibold text-text">{technology.name}</h4>
          <p className="label-eyebrow mt-0.5">{categoryLabel}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-text-muted sm:text-base">{technology.description}</p>

      <div className="mt-5">
        <p className="label-eyebrow mb-3">How it connects</p>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
          {chain.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span
                className={
                  i === 0
                    ? "rounded-pill border border-accent-cyan/50 bg-accent-cyan/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-accent-cyan"
                    : i === chain.length - 1
                      ? "rounded-pill border border-accent-primary/40 bg-accent-primary/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text"
                      : "rounded-pill border border-border bg-bg/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted"
                }
              >
                {step}
              </span>
              {i < chain.length - 1 && (
                <span className="text-text-faint" aria-hidden="true">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
