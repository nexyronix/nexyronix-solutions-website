import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const REVEAL = "transition-all duration-700 ease-signature";

export function InternshipCTA() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  return (
    <div ref={ref} id="internship-apply" className="mt-section-y scroll-mt-24">
      <Container size="page">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/40 px-6 py-14 text-center backdrop-blur-sm sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-radial-fade" aria-hidden="true" />

          <div className="relative">
            <h3
              className={cn(
                "font-display text-display-sm font-semibold uppercase text-text sm:text-display-md",
                REVEAL,
                revealed
              )}
            >
              Ready to start building?
            </h3>
            <p
              className={cn("mx-auto mt-4 max-w-lg text-base text-text-muted", REVEAL, revealed)}
              style={{ transitionDelay: "100ms" }}
            >
              Choose a domain, explore the opportunity and take your next step with Nexyronix.
            </p>

            <div
              className={cn("mt-9 flex flex-wrap items-center justify-center gap-4", REVEAL, revealed)}
              style={{ transitionDelay: "180ms" }}
            >
              <Button href="#contact" size="md" className="group/btn uppercase tracking-wide" icon={<ArrowIcon />}>
                Apply for Internship
              </Button>
              <Button
                href="#internship-domains"
                variant="secondary"
                size="md"
                className="uppercase tracking-wide"
              >
                Explore Domains
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
