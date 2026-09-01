import { useMemo, useState } from "react";
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

  // Filtering only makes sense for the tall vertical list (desktop) — the
  // horizontal one already scrolls sideways instead of growing the page.
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    if (!isVertical || !query.trim()) return industries;
    const q = query.trim().toLowerCase();
    return industries.filter((ind) => ind.name.toLowerCase().includes(q));
  }, [industries, isVertical, query]);

  return (
    <div className={className}>
      {isVertical && industries.length > 8 && (
        <div className="relative mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter industries…"
            aria-label="Filter industries"
            className="h-10 w-full rounded-lg border border-border bg-bg/60 px-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-cyan/40"
          />
        </div>
      )}
      <div
        role="tablist"
        aria-orientation={orientation}
        aria-label="Industries"
        className={cn(
          isVertical ? "flex max-h-[420px] flex-col gap-1 overflow-y-auto pr-2" : "flex gap-2 overflow-x-auto pb-2"
        )}
      >
        {visible.length === 0 && (
          <p className="px-2 py-3 text-sm text-text-faint">No industries match "{query}".</p>
        )}
        {visible.map((ind) => {
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
    </div>
  );
}
