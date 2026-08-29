import { Container } from "@/components/ui/Container";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

const REVEAL = "transition-all duration-700 ease-signature";

/**
 * No open positions exist to list, so this section doesn't pretend
 * otherwise — see the Careers CTA below for the honest framing. What it can
 * say truthfully: the kind of work Nexyronix does (already established by
 * the Solutions section) and what it values (already established by
 * COMPANY_VALUES in About) — nothing new is invented here.
 */
export function CareersHero() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  return (
    <div ref={ref}>
      <Container size="page">
        <div className="max-w-2xl">
          <p className={cn("label-eyebrow", REVEAL, revealed)}>Careers at Nexyronix</p>
          <h2
            className={cn(
              "mt-4 font-display text-display-md font-semibold uppercase leading-[1.08] text-text",
              REVEAL,
              revealed
            )}
            style={{ transitionDelay: "80ms" }}
          >
            Build technology with us.
          </h2>
          <p
            className={cn("mt-5 text-base text-text-muted sm:text-lg", REVEAL, revealed)}
            style={{ transitionDelay: "160ms" }}
          >
            Nexyronix builds websites, applications, custom software and AI-driven digital
            products. We don&apos;t have specific open positions listed right now, but we&apos;re
            always glad to hear from people who want to work on real products and solve real
            problems — with a focus on quality, collaboration and continuous learning.
          </p>
        </div>
      </Container>
    </div>
  );
}
