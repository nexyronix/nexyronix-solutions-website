import { cn } from "@/lib/cn";
import type { ProcessStageData } from "./processData";

interface ProcessStageProps {
  stage: ProcessStageData;
  variant?: "panel" | "compact";
  /** Suppress the inline stage number — used on mobile where the timeline dot already shows it. */
  hideNumber?: boolean;
  className?: string;
}

export function ProcessStage({ stage, variant = "panel", hideNumber = false, className }: ProcessStageProps) {
  const isCompact = variant === "compact";

  return (
    <div className={cn(className)}>
      <div className="flex items-baseline gap-3">
        {!hideNumber && (
          <span className={cn("font-mono text-text-faint", isCompact ? "text-xs" : "text-sm")}>{stage.number}</span>
        )}
        <h3 className={cn("font-display font-semibold text-text", isCompact ? "text-lg" : "text-2xl")}>
          {stage.name}
        </h3>
      </div>
      <p className={cn("mt-2 font-display text-accent-cyan", isCompact ? "text-sm" : "text-base")}>
        {stage.statement}
      </p>
      <p className={cn("mt-3 text-text-muted", isCompact ? "text-sm" : "text-base")}>{stage.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {stage.activities.map((activity) => (
          <span
            key={activity}
            className="rounded-pill border border-border bg-surface/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted"
          >
            {activity}
          </span>
        ))}
      </div>
    </div>
  );
}
