import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  /** Shows a small pulsing status dot — for "live"/system-status style tags. */
  dot?: boolean;
  className?: string;
}

/** Small pill used for eyebrows, tags, and system-status style labels. */
export function Badge({ children, dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-pill border border-border bg-surface/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted backdrop-blur-sm",
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-status-online animate-pulse-slow" />}
      {children}
    </span>
  );
}
