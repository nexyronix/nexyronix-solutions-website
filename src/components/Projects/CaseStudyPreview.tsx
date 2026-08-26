import { cn } from "@/lib/cn";
import type { CaseStudy } from "@/data/projects";

interface CaseStudyPreviewProps {
  /** Omitted for concepts — the section then renders as the empty structure. */
  caseStudy?: CaseStudy;
  revealed: boolean;
}

const SECTIONS: { key: keyof CaseStudy; label: string; prompt: string }[] = [
  { key: "challenge", label: "The Challenge", prompt: "What problem needed to be solved?" },
  { key: "approach", label: "The Approach", prompt: "How was the problem approached?" },
  { key: "solution", label: "The Solution", prompt: "What was built?" },
  { key: "technology", label: "Technology", prompt: "What technologies were used?" },
];

/**
 * The case-study shape, rendered from data. For concepts there is no data, so
 * it shows the structure itself rather than inventing content.
 *
 * `outcome` is handled separately and deliberately: it renders ONLY when real
 * verified results exist. There is no placeholder state for it — an empty
 * outcome block is far better than a fabricated metric.
 */
export function CaseStudyPreview({ caseStudy, revealed }: CaseStudyPreviewProps) {
  const hasData = Boolean(caseStudy);

  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border bg-surface/20 p-7 backdrop-blur-sm transition-all duration-700 ease-signature sm:p-10",
        revealed ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="label-eyebrow">Case Study Structure</p>
        {!hasData && (
          <span className="rounded-pill border border-border bg-bg/50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-text-faint">
            Awaiting real project data
          </span>
        )}
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-muted">
        Each real project will be documented in this structure. Nothing here is filled with
        example content — the sections stay empty until there is an actual project to describe.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map((section) => {
          const value = caseStudy?.[section.key];
          return (
            <div key={section.key} className="rounded-xl border border-border bg-bg/40 p-5">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.06em] text-text">
                {section.label}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-text-faint">
                {value ?? section.prompt}
              </p>
            </div>
          );
        })}
      </div>

      {/* Outcome — present only with verified data. Never a placeholder. */}
      {caseStudy?.outcome ? (
        <div className="mt-5 rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-5">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.06em] text-text">
            Outcome
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">{caseStudy.outcome}</p>
        </div>
      ) : (
        <p className="mt-5 text-xs leading-relaxed text-text-faint">
          Outcome metrics will be published only where verified results are available.
        </p>
      )}
    </div>
  );
}
