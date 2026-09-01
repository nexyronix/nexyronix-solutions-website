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
          context === "nav" ? "text-[10px] tracking-[0.18em] mt-1" : "text-xs tracking-[0.24em] mt-2"
        )}
      >
        Solutions Private Limited
      </span>
    </div>
  );
}
