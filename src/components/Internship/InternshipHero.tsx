import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { InternshipVisual } from "./InternshipVisual";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const REVEAL = "transition-all duration-700 ease-signature";

export function InternshipHero() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  return (
    <div ref={ref}>
      <Container size="page">
        <div className="max-w-3xl">
          <p className={cn("label-eyebrow", REVEAL, revealed)}>Software &amp; Technology Internships</p>
          <h2
            className={cn(
              "mt-4 font-display text-display-md font-semibold uppercase leading-[1.08] text-text",
              REVEAL,
              revealed
            )}
            style={{ transitionDelay: "80ms" }}
          >
            Your first step into the real world of technology.
          </h2>
          <p
            className={cn("mt-5 max-w-2xl text-base text-text-muted sm:text-lg", REVEAL, revealed)}
            style={{ transitionDelay: "160ms" }}
          >
            Nexyronix provides internship opportunities for students from universities and colleges
            across multiple technology and non-technology domains, helping students gain practical
            exposure to projects, tools and professional workflows.
          </p>

          <div
            className={cn("mt-9 flex flex-wrap items-center gap-4", REVEAL, revealed)}
            style={{ transitionDelay: "240ms" }}
          >
            <Button href="#internship-domains" size="md" className="group/btn uppercase tracking-wide" icon={<ArrowIcon />}>
              Explore Internships
            </Button>
            <Button
              href="#internship-apply"
              variant="secondary"
              size="md"
              className="group/btn uppercase tracking-wide"
              icon={<ArrowIcon />}
            >
              Apply Now
            </Button>
          </div>
        </div>
      </Container>

      {/* Pathway visual — full-bleed within the container, sits below the intro copy */}
      <Container size="page">
        <div
          className={cn(
            "mt-14 overflow-hidden rounded-2xl border border-border bg-surface/25 px-4 py-8 backdrop-blur-sm sm:px-8",
            REVEAL,
            revealed
          )}
          style={{ transitionDelay: "320ms" }}
        >
          <div className="min-w-[560px] sm:min-w-0 sm:overflow-visible">
            <InternshipVisual />
          </div>
        </div>
      </Container>
    </div>
  );
}
