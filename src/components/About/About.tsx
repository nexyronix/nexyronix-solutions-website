import { Container } from "@/components/ui/Container";
import { CompanyStory } from "./CompanyStory";
import { CompanyPillars } from "./CompanyPillars";
import { MissionVision } from "./MissionVision";
import { Values } from "./Values";
import { AboutCTA } from "./AboutCTA";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const REVEAL = "transition-all duration-700 ease-signature";

export function About() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  return (
    <section id="about" className="scroll-mt-20 relative border-t border-border bg-bg-secondary py-section-y">
      {/* Continuity seam from Projects above — what we build → who we are */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg/60 to-transparent"
        aria-hidden="true"
      />

      <div ref={ref} className="relative">
        <Container size="page">
          <div className="max-w-3xl">
            <p className={cn("label-eyebrow", REVEAL, revealed)}>About Nexyronix</p>
            <h2
              className={cn(
                "mt-4 font-display text-display-md font-semibold uppercase text-text",
                REVEAL,
                revealed
              )}
              style={{ transitionDelay: "80ms" }}
            >
              We are Nexyronix.
            </h2>
            <p
              className={cn("mt-5 text-base text-text-muted sm:text-lg", REVEAL, revealed)}
              style={{ transitionDelay: "160ms" }}
            >
              Nexyronix Solutions Private Limited is a software technology company focused on
              building digital products, applications and customized technology solutions.
            </p>
          </div>
        </Container>
      </div>

      <CompanyStory />
      <CompanyPillars />
      <MissionVision />
      <Values />
      <AboutCTA />
    </section>
  );
}
