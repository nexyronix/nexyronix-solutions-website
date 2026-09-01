import { cn } from "@/lib/cn";
import type { ProcessStageData } from "./processData";

interface ProcessTimelineProps {
  stages: ProcessStageData[];
  activeIndex: number;
  onHover: (index: number | null) => void;
}

export function ProcessTimeline({ stages, activeIndex, onHover }: ProcessTimelineProps) {
  return (
    <div className="relative flex items-start justify-between">
      <div className="absolute inset-x-0 top-[7px] h-px bg-border" aria-hidden="true" />
      <div
        className="absolute left-0 top-[7px] h-px bg-accent-cyan transition-all duration-500 ease-signature"
        style={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
        aria-hidden="true"
      />

      {stages.map((stage, i) => {
        const isActive = i === activeIndex;
        const isPast = i < activeIndex;
        return (
          <button
            key={stage.id}
            type="button"
            onMouseEnter={() => onHover(i)}
            onFocus={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
            onBlur={() => onHover(null)}
            aria-pressed={isActive}
            aria-label={`${stage.name} — ${stage.statement}`}
            className={cn(
              "relative z-10 flex flex-1 flex-col items-center gap-2 rounded-lg px-1 py-2 text-center transition-colors duration-300",
              isActive && "bg-surface"
            )}
          >
            <span
              className={cn(
                "h-3.5 w-3.5 rounded-full border-2 transition-all duration-300",
                isActive
                  ? "scale-125 border-accent-cyan bg-accent-cyan shadow-glow-cyan"
                  : isPast
                    ? "border-accent-primary bg-accent-primary/50"
                    : "border-border bg-bg"
              )}
            />
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-300",
                isActive ? "text-text" : "text-text-faint"
              )}
            >
              {stage.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
