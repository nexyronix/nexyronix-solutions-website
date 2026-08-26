import { DomainIconGlyph } from "./DomainIconGlyph";
import { cn } from "@/lib/cn";
import type { InternshipDomain } from "@/data/internshipDomains";

interface DomainCardProps {
  domain: InternshipDomain;
  isOpen: boolean;
  onToggle: (id: string) => void;
  revealed: boolean;
  delayMs: number;
}

export function DomainCard({ domain, isOpen, onToggle, revealed, delayMs }: DomainCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(domain.id)}
      aria-expanded={isOpen}
      aria-controls={`domain-detail-${domain.id}`}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        "group flex w-full flex-col rounded-xl border p-5 text-left backdrop-blur-sm",
        "transition-all duration-500 ease-signature hover:-translate-y-1 hover:border-accent-primary/50 hover:shadow-glow-primary",
        isOpen ? "border-accent-cyan/50 bg-surface" : "border-border bg-surface/50",
        revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300",
            isOpen ? "border-accent-cyan/50 bg-accent-cyan/5" : "border-border bg-bg/50"
          )}
        >
          <DomainIconGlyph icon={domain.icon} />
        </span>
        <span
          className={cn(
            "mt-1 shrink-0 text-text-faint transition-all duration-300",
            "group-hover:text-accent-primary",
            isOpen && "rotate-90 text-accent-cyan"
          )}
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 3l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <h4 className="mt-4 font-display text-base font-semibold text-text">{domain.name}</h4>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{domain.description}</p>
    </button>
  );
}
