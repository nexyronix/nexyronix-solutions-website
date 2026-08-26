import { cn } from "@/lib/cn";
import type { Industry } from "./industriesData";

interface IndustrySelectorProps {
  industries: Industry[];
  selectedId: string;
  onSelect: (id: string) => void;
  orientation: "vertical" | "horizontal";
  className?: string;
}

export function IndustrySelector({ industries, selectedId, onSelect, orientation, className }: IndustrySelectorProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      aria-label="Industries"
      className={cn(
        isVertical ? "flex max-h-[420px] flex-col gap-1 overflow-y-auto pr-2" : "flex gap-2 overflow-x-auto pb-2",
        className
      )}
    >
      {industries.map((ind) => {
        const isActive = ind.id === selectedId;
        return (
          <button
            key={ind.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(ind.id)}
            className={cn(
              "shrink-0 rounded-lg border text-left transition-all duration-200",
              isVertical ? "px-4 py-2.5 text-sm" : "whitespace-nowrap px-3.5 py-2 text-xs",
              isActive
                ? "border-accent-cyan/50 bg-surface text-text"
                : "border-transparent text-text-muted hover:border-border hover:bg-surface/50 hover:text-text"
            )}
          >
            <span
              className={cn(
                "mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle transition-colors duration-200",
                isActive ? "bg-accent-cyan" : "bg-border-strong"
              )}
              aria-hidden="true"
            />
            {ind.name}
          </button>
        );
      })}
    </div>
  );
}
