import { Container } from "@/components/ui/Container";
import { SolutionCard } from "./SolutionCard";
import { SOLUTIONS } from "./solutionsData";
import { useInViewOnce } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

// Desktop bento layout: Websites + Applications form a taller "feature" row
// (matching the brief's suggested arrangement), the remaining six sit in
// two even rows of three across a 6-column track.
const SPAN: Record<string, string> = {
  websites: "sm:col-span-2 lg:col-span-4 lg:min-h-[320px]",
  applications: "lg:col-span-2 lg:min-h-[320px]",
  "custom-software": "lg:col-span-2",
  "ai-solutions": "lg:col-span-2",
  saas: "lg:col-span-2",
  automation: "lg:col-span-2",
  "data-apis": "lg:col-span-2",
  ecommerce: "lg:col-span-2",
};

/** Shared transition classes for the scroll-reveal elements in this section. */
const REVEAL = "transition-all duration-700 ease-signature";

export function Solutions() {
  const { ref, inView } = useInViewOnce<HTMLElement>();
  const revealed = inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0";

  return (
    <section id="solutions" ref={ref} className="scroll-mt-20 relative border-t border-border bg-bg py-section-y">
      <Container size="page">
        <div className="max-w-2xl">
          <h2 className={cn("font-display text-display-md font-semibold text-text", REVEAL, revealed)}>
            What We Create
          </h2>
          <p
            className={cn("mt-5 text-base text-text-muted sm:text-lg", REVEAL, revealed)}
            style={{ transitionDelay: "120ms" }}
          >
            From digital experiences to intelligent software, we build technology around
            real-world problems.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {SOLUTIONS.map((category, i) => (
            <SolutionCard
              key={category.id}
              category={category}
              revealed={inView}
              delayMs={240 + i * 70}
              className={SPAN[category.id]}
            />
          ))}
        </div>

        <div
          className={cn("mt-16 flex flex-col items-center gap-4 text-center", REVEAL, revealed)}
          style={{ transitionDelay: "820ms" }}
        >
          <p className="font-display text-sm font-medium uppercase tracking-[0.14em] text-text-muted">
            One idea. Many ways to build it.
          </p>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="text-text-faint" aria-hidden="true">
            <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M2 12L8 18L14 12"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Container>
    </section>
  );
}
