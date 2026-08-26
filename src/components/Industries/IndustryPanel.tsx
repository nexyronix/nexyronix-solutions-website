import { IndustryGlyphIcon } from "./IndustryGlyph";
import type { Industry } from "./industriesData";

interface IndustryPanelProps {
  industry: Industry;
}

export function IndustryPanel({ industry }: IndustryPanelProps) {
  return (
    <div role="tabpanel" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface/60">
          <IndustryGlyphIcon glyph={industry.glyph} />
        </span>
        <h3 className="font-display text-xl font-semibold text-text sm:text-2xl">{industry.name}</h3>
      </div>

      <p className="mt-4 text-text-muted">{industry.description}</p>

      <div className="mt-6">
        <p className="label-eyebrow mb-2">Possible Solutions</p>
        <div className="flex flex-wrap gap-2">
          {industry.solutions.map((solution) => (
            <span
              key={solution}
              className="rounded-pill border border-border bg-surface/50 px-2.5 py-1 text-xs text-text-muted"
            >
              {solution}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="label-eyebrow mb-2">Connects To</p>
        <div className="flex flex-wrap gap-2">
          {industry.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-pill border border-accent-primary/30 bg-accent-primary/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-accent-cyan"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
