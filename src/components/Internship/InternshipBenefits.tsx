import { Container } from "@/components/ui/Container";
import { INTERNSHIP_BENEFITS } from "@/data/internshipJourney";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const REVEAL = "transition-all duration-700 ease-signature";

export function InternshipBenefits() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  return (
    <div ref={ref} className="mt-section-y">
      <Container size="page">
        <div className="max-w-2xl">
          <p className={cn("label-eyebrow", REVEAL, revealed)}>Why Nexyronix</p>
          <h3
            className={cn("mt-4 font-display text-display-sm font-semibold uppercase text-text", REVEAL, revealed)}
            style={{ transitionDelay: "80ms" }}
          >
            What an internship here involves
          </h3>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INTERNSHIP_BENEFITS.map((benefit, i) => (
            <div
              key={benefit.id}
              className={cn(
                "rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm",
                "transition-all duration-500 ease-signature hover:border-border-strong",
                REVEAL,
                revealed
              )}
              style={{ transitionDelay: `${160 + i * 70}ms` }}
            >
              <span className="label-eyebrow">{String(i + 1).padStart(2, "0")}</span>
              <h4 className="mt-3 font-display text-base font-semibold text-text">{benefit.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{benefit.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
