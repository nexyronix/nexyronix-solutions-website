import { cn } from "@/lib/cn";

interface LogoProps {
  /** "nav" is compact for the header; "footer" gives the mark more room to breathe. */
  context?: "nav" | "footer";
  className?: string;
}

/**
 * Temporary text-based wordmark. Intentionally simple per brief — a mark
 * this component can be swapped for a graphic lockup later without
 * touching Navbar/Footer.
 */
export function Logo({ context = "nav", className }: LogoProps) {
  return (
    <div className={cn("flex flex-col leading-none select-none", className)}>
      <span
        className={cn(
          "font-display font-semibold tracking-tight text-text",
          context === "nav" ? "text-lg" : "text-2xl"
        )}
      >
        NEXYRONIX
      </span>
      <span
        className={cn(
          "font-mono text-text-faint uppercase",
          context === "nav" ? "text-[9px] tracking-[0.22em] mt-1" : "text-[11px] tracking-[0.28em] mt-2"
        )}
      >
        Solutions Private Limited
      </span>
    </div>
  );
}
