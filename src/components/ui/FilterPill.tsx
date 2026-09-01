import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type Variant = "tag" | "chip";

interface FilterPillProps {
  active: boolean;
  variant?: Variant;
  children: ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

const base =
  "inline-flex items-center gap-2 rounded-pill border transition-colors duration-200";

const variants: Record<Variant, string> = {
  // Abstract node/keyword tags — monospace, uppercase, tracked (TechnologyUniverse's ecosystem nodes).
  tag: "px-3 py-2.5 font-mono text-xs uppercase tracking-[0.12em]",
  // Named-item chips with a leading icon — sentence case (Technology's "Selected Technologies").
  chip: "px-3 py-1.5 text-xs",
};

const state = {
  active: "border-accent-cyan/60 bg-surface text-text",
  inactive: "border-border text-text-muted hover:border-border-strong hover:text-text",
};

/**
 * Shared toggle-pill control for standalone filter/keyword groups (not tabs —
 * those keep their own role="tab" semantics in IndustrySelector and
 * InternshipDomains, which is a different interaction pattern and shouldn't
 * be forced through this component). `variant` keeps each call site's
 * existing, intentionally different visual treatment instead of collapsing
 * them into one look.
 */
export function FilterPill({
  active,
  variant = "tag",
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  className,
}: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-pressed={active}
      className={cn(base, variants[variant], active ? state.active : state.inactive, className)}
    >
      {children}
    </button>
  );
}
