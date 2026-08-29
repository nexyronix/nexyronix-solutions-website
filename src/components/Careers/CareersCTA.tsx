import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const REVEAL = "transition-all duration-700 ease-signature";

export function CareersCTA() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  return (
    <div ref={ref} className="mt-section-y">
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
              Interested in working with us?
            </h3>
            <p
              className={cn("mx-auto mt-4 max-w-lg text-base text-text-muted", REVEAL, revealed)}
              style={{ transitionDelay: "100ms" }}
            >
              Send us a note about what you do and what you&apos;re looking for. We&apos;ll keep
              it on file for when the right opportunity comes up.
            </p>

            <div
              className={cn("mt-9 flex flex-wrap items-center justify-center gap-4", REVEAL, revealed)}
              style={{ transitionDelay: "180ms" }}
            >
              <Button href="#contact" size="md" className="group/btn uppercase tracking-wide" icon={<ArrowIcon />}>
                Get in Touch
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
