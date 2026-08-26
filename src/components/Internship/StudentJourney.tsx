import { Container } from "@/components/ui/Container";
import { STUDENT_JOURNEY } from "@/data/internshipJourney";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const REVEAL = "transition-all duration-700 ease-signature";

export function StudentJourney() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  return (
    <div ref={ref} className="mt-section-y-sm">
      <Container size="page">
        {/* The big two-beat statement */}
        <div className="mx-auto max-w-3xl text-center">
          <h3
            className={cn(
              "font-display text-display-sm font-semibold uppercase text-text-muted sm:text-display-md",
              REVEAL,
              revealed
            )}
          >
            Don't just learn technology.
          </h3>
          <h3
            className={cn(
              "mt-2 font-display text-display-sm font-semibold uppercase text-text sm:text-display-md",
              REVEAL,
              revealed
            )}
            style={{ transitionDelay: "220ms" }}
          >
            Build with it.
          </h3>
          <p
            className={cn("mx-auto mt-5 max-w-xl text-base text-text-muted", REVEAL, revealed)}
            style={{ transitionDelay: "340ms" }}
          >
            Turn knowledge into practical experience by working through structured projects, modern
            tools and real-world development workflows.
          </p>
        </div>

        {/* Journey — horizontal rail on desktop */}
        <ol className="mt-16 hidden lg:grid lg:grid-cols-5 lg:gap-6">
          {STUDENT_JOURNEY.map((step, i) => (
            <li
              key={step.id}
              className={cn("relative", REVEAL, revealed)}
              style={{ transitionDelay: `${400 + i * 90}ms` }}
            >
              <div className="flex items-center">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-accent-cyan/60 bg-accent-cyan/10 font-mono text-[11px] text-text">
                  {step.number}
                </span>
                {i < STUDENT_JOURNEY.length - 1 && (
                  <span className="ml-3 h-px flex-1 bg-border" aria-hidden="true" />
                )}
              </div>
              <h4 className="mt-5 font-display text-lg font-semibold text-text">{step.name}</h4>
              <p className="mt-2 pr-4 text-sm leading-relaxed text-text-muted">{step.description}</p>
            </li>
          ))}
        </ol>

        {/* Journey — vertical rail on mobile */}
        <ol className="mt-12 lg:hidden">
          {STUDENT_JOURNEY.map((step, i) => (
            <li key={step.id} className="flex gap-4 pb-7 last:pb-0">
              <div className="flex flex-col items-center">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-accent-cyan/60 bg-accent-cyan/10 font-mono text-[11px] text-text">
                  {step.number}
                </span>
                {i < STUDENT_JOURNEY.length - 1 && (
                  <span className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />
                )}
              </div>
              <div className="flex-1 pt-1">
                <h4 className="font-display text-base font-semibold text-text">{step.name}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </div>
  );
}
