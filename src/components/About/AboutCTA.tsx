import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const REVEAL = "transition-all duration-700 ease-signature";

export function AboutCTA() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  return (
    <div ref={ref}>
      {/* Full-width statement — deliberately spacious */}
      <Container size="page">
        <div className="py-section-y text-center">
          <h3
            className={cn(
              "mx-auto max-w-5xl font-display text-display-sm font-semibold uppercase leading-[1.15] text-text sm:text-display-md lg:text-display-lg",
              REVEAL,
              revealed
            )}
          >
            Technology is the tool.
            <br />
            <span className="text-accent-primary">Possibility is the purpose.</span>
          </h3>
          <p
            className={cn("mx-auto mt-8 max-w-xl text-base text-text-muted", REVEAL, revealed)}
            style={{ transitionDelay: "140ms" }}
          >
            Nexyronix brings technology and ideas together to create digital experiences,
            applications and solutions for the real world.
          </p>
        </div>
      </Container>

      {/* CTA */}
      <Container size="page">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-border bg-surface/40 px-6 py-14 text-center backdrop-blur-sm sm:px-12",
            REVEAL,
            revealed
          )}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-radial-fade" aria-hidden="true" />

          <div className="relative">
            <h4 className="font-display text-display-sm font-semibold uppercase text-text">
              Build with Nexyronix
            </h4>
            <p className="mx-auto mt-4 max-w-md text-base text-text-muted">
              Have a project, idea or opportunity? Let's start a conversation.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Button href="#contact" size="md" className="group/btn uppercase tracking-wide" icon={<ArrowIcon />}>
                Start a Project
              </Button>
              <Button
                href="#internships"
                variant="secondary"
                size="md"
                className="group/btn uppercase tracking-wide"
                icon={<ArrowIcon />}
              >
                Explore Internships
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
