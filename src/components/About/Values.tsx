import { Container } from "@/components/ui/Container";
import { COMPANY_VALUES, type ValueIcon } from "@/data/values";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const C = "#45e0e8";
const REVEAL = "transition-all duration-700 ease-signature";

function ValueIconGlyph({ icon }: { icon: ValueIcon }) {
  const s = { stroke: C, strokeWidth: 1.3 } as const;
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      {icon === "innovation" && (
        <g {...s} strokeLinejoin="round">
          <path d="M12 3l1.8 5.7L19.5 10l-5.7 1.8L12 17.5l-1.8-5.7L4.5 10l5.7-1.3z" />
          <path d="M18 16l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7z" opacity="0.5" />
        </g>
      )}
      {icon === "integrity" && <path d="M12 3l7 3v6c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6z" {...s} strokeLinejoin="round" />}
      {icon === "quality" && (
        <g {...s} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" opacity="0.5" />
          <path d="M8 12.5l2.8 2.8L16 10" />
        </g>
      )}
      {icon === "learning" && (
        <g {...s} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8.5L12 4.5l9 4-9 4z" />
          <path d="M7 11v5c0 1.5 2.2 2.5 5 2.5s5-1 5-2.5v-5" opacity="0.6" />
        </g>
      )}
      {icon === "collaboration" && (
        <g {...s}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.2" opacity="0.6" />
          <path d="M3.5 19a5.5 5.5 0 0111 0" strokeLinecap="round" />
          <path d="M16 15a4.5 4.5 0 014.5 4" opacity="0.6" strokeLinecap="round" />
        </g>
      )}
      {icon === "customer-focus" && (
        <g {...s} strokeLinecap="round">
          <circle cx="12" cy="12" r="8" opacity="0.55" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1.3" fill={C} stroke="none" />
        </g>
      )}
    </svg>
  );
}

export function Values() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  return (
    <div ref={ref} className="mt-section-y">
      <Container size="page">
        <div className="max-w-2xl">
          <p className={cn("label-eyebrow", REVEAL, revealed)}>What We Value</p>
          <h3
            className={cn("mt-4 font-display text-display-sm font-semibold uppercase text-text", REVEAL, revealed)}
            style={{ transitionDelay: "80ms" }}
          >
            How we work
          </h3>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMPANY_VALUES.map((value, i) => (
            <div
              key={value.id}
              className={cn(
                "group rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm",
                "transition-all duration-500 ease-signature hover:-translate-y-1 hover:border-accent-primary/50 hover:bg-surface",
                REVEAL,
                revealed
              )}
              style={{ transitionDelay: `${140 + i * 70}ms` }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg/50 transition-transform duration-300 group-hover:scale-105">
                <ValueIconGlyph icon={value.icon} />
              </span>
              <h4 className="mt-4 font-display text-base font-semibold text-text">{value.name}</h4>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{value.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
